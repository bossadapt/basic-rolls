// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use calamine::{open_workbook, Data, RangeDeserializerBuilder, Reader, Xlsx};
use rfd::AsyncFileDialog;
use rusqlite::Connection;
use serde::{Deserialize, Serialize};
use tauri::{api::file, http::Request};

#[derive(Serialize, Deserialize)]
struct Roll {
    roll_name: String,
    default_roll: String,
}
#[derive(Serialize, Deserialize)]
struct AbilityScore {
    ability: String,
    score: i8,
}

fn string_to_xy(input: &str) -> (u32, u32) {
    // a123 // 1
    let mut x: u32 = 0;
    let mut char_count: usize = 0;
    for cha in input.chars() {
        let current_ascii = cha.to_ascii_lowercase() as u8;
        if current_ascii > 140 && current_ascii < 173 {
            char_count += 1;
            x += (current_ascii - 141) as u32;
        } else {
            break;
        }
    }
    // a123 // 123
    let y = input[char_count..input.len()].parse::<u32>().unwrap();
    (x, y)
}
//-> Result<Vec<String>, ()>
#[tauri::command]
async fn get_data_from_excel(file_path: &str, requested_cells: &str) -> Result<Vec<String>, ()> {
    //possible requested cells
    // a0 / a1-b3
    //todo need to know sheet name
    println!("ran with file:{} request:{}", file_path, requested_cells);
    let mut workbook: Xlsx<_> = open_workbook(file_path).unwrap();
    let cell_total: Vec<String> = Vec::new();
    if requested_cells.contains("-") {
        let requests: Vec<&str> = requested_cells.split("-").collect();
        let (x1, y1) = string_to_xy(requests[0]);
        let (x2, y2) = string_to_xy(requests[1]);

        string_to_xy(requested_cells);
        let sheet = workbook.worksheet_range("Sheet1").unwrap();
        let range_in_sheet = sheet.range((x1, y1), (x2, y2));
        let cells = range_in_sheet.cells();
        let mut cell_total: Vec<String> = Vec::new();
        for cell in cells {
            println!("Cell 0:{},Cell 1:{},Cell 2:{}", cell.0, cell.1, cell.2);
            cell_total.push(cell.2.to_string());
        }
    } else {
        let mut x1: u32;
        let mut y1: u32;
        let range = workbook.worksheet_range("Sheet1").unwrap();
    }
    return Ok(cell_total);
}
#[tauri::command]
async fn get_file_path_by_file_dialog() -> Result<String, ()> {
    println!("file explore");
    let file = AsyncFileDialog::new()
        .add_filter("Excel", &["xls", "xlsx", "xlsm", "xlsb", "xla", "xlam"])
        .add_filter("openDoc", &["ods"])
        .set_directory("/")
        .pick_file()
        .await;

    return Ok(file.unwrap().path().to_str().unwrap().to_owned());
}
#[tauri::command]
fn overwrite_ability_scores(ability_scores: Vec<AbilityScore>) -> Result<(), ()> {
    let conn = Connection::open("userPage").unwrap();
    //delete all old ones
    conn.execute("DELETE FROM abilityScores", ())
        .expect("Failed to delete");
    for ability_score in ability_scores {
        conn.execute(
            "INSERT INTO abilityScores(ability,score) VALUES((?1),(?2))",
            (ability_score.ability, ability_score.score),
        )
        .expect("failed to add");
    }
    Ok(())
}
#[tauri::command]
fn overwrite_rolls(new_rolls: Vec<Roll>) -> Result<(), ()> {
    let conn = Connection::open("userPage").unwrap();
    //delete all old ones
    conn.execute("DELETE FROM rolls", ())
        .expect("Failed to delete");
    for roll in new_rolls {
        conn.execute(
            "INSERT INTO rolls(rollName,defaultRoll) VALUES((?1),(?2))",
            (roll.roll_name, roll.default_roll),
        )
        .expect("failed to add");
    }
    Ok(())
}
#[tauri::command]
fn grab_ability_scores() -> Result<Vec<AbilityScore>, ()> {
    let conn = Connection::open("userPage").unwrap();
    let query = "SELECT * FROM abilityScores";
    let mut stmt = conn.prepare(&query).unwrap();
    let mut rows = stmt.query([]).unwrap();
    let mut ability_scores: Vec<AbilityScore> = Vec::new();
    while let Some(row) = rows.next().unwrap() {
        ability_scores.push(AbilityScore {
            ability: row.get(0).unwrap(),
            score: row.get(1).unwrap(),
        });
    }
    Ok(ability_scores)
}
#[tauri::command]
fn grab_rolls() -> Result<Vec<Roll>, ()> {
    let conn = Connection::open("userPage").unwrap();
    let query = "SELECT * FROM rolls";
    let mut stmt = conn.prepare(&query).unwrap();
    let mut rows = stmt.query([]).unwrap();
    let mut rolls: Vec<Roll> = Vec::new();
    while let Some(row) = rows.next().unwrap() {
        rolls.push(Roll {
            roll_name: row.get(0).unwrap(),
            default_roll: row.get(1).unwrap(),
        });
    }
    Ok(rolls)
}
#[tauri::command]
fn get_lists() -> Result<(Vec<Roll>, Vec<AbilityScore>), ()> {
    let conn = Connection::open("userPage").unwrap();
    establish_sql(&conn); //if not already set up
    let query = "SELECT * FROM rolls";
    let mut stmt = conn.prepare(&query).unwrap();
    let mut rows = stmt.query([]).unwrap();
    let mut rolls: Vec<Roll> = Vec::new();
    while let Some(row) = rows.next().unwrap() {
        rolls.push(Roll {
            roll_name: row.get(0).unwrap(),
            default_roll: row.get(1).unwrap(),
        });
    }
    //
    let query = "SELECT * FROM abilityScores";
    let mut stmt = conn.prepare(&query).unwrap();
    let mut rows = stmt.query([]).unwrap();
    let mut ability_scores: Vec<AbilityScore> = Vec::new();
    while let Some(row) = rows.next().unwrap() {
        ability_scores.push(AbilityScore {
            ability: row.get(0).unwrap(),
            score: row.get(1).unwrap(),
        });
    }
    return Ok((rolls, ability_scores));
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_lists,
            overwrite_ability_scores,
            overwrite_rolls,
            grab_ability_scores,
            grab_rolls,
            get_file_path_by_file_dialog,
            get_data_from_excel
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
fn establish_sql(conn: &Connection) {
    let _ = conn
        .execute(
            "CREATE TABLE if not exists rolls(
            rollName    TEXT PRIMARY KEY,
            defaultRoll TEXT
        )",
            (),
        )
        .is_ok();
    // ability: Strength ||| score 0-20ish
    let _ = conn
        .execute(
            "CREATE TABLE if not exists abilityScores(
            ability    TEXT PRIMARY KEY,
            score      INTEGER
        )",
            (),
        )
        .is_ok();
}
