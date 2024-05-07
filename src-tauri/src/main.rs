// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use std::fmt::format;

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
struct CharacterInfo {
    info_type: String,
    input: String,
}
#[derive(Serialize, Deserialize)]
struct AbilityScore {
    ability: String,
    score: i8,
}
#[derive(Clone)]
struct DatabaseChange {
    condition: String,
    name: String,
    change_effect: String,
}
#[derive(Serialize, Deserialize)]
struct Change {
    name: String,
    change_effect: String,
}
//left to understand what needs to put
struct DatabaseCondition {
    name: String,
    turn_based: bool,
    length: i64,
}
#[derive(Serialize, Deserialize)]
struct Condition {
    name: String,
    turn_based: bool,
    length: i64,
    rolls_changes: Vec<Change>,
    ability_scores_changes: Vec<Change>,
    character_info_changes: Vec<Change>,
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
fn overwrite_character_info(character_info_list: Vec<CharacterInfo>) -> Result<(), ()> {
    let conn = Connection::open("userPage").unwrap();
    //delete all old ones
    conn.execute("DELETE FROM characterInfo", ())
        .expect("Failed to delete");
    for character_info in character_info_list {
        conn.execute(
            "INSERT INTO characterInfo(info_type,input) VALUES((?1),(?2))",
            (character_info.info_type, character_info.input),
        )
        .expect("failed to add");
    }
    Ok(())
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
fn overwrite_conditions(new_conditions: Vec<Condition>) -> Result<(), ()> {
    let conn = Connection::open("userPage").unwrap();
    //delete all old ones
    conn.execute("DELETE FROM conditions", ())
        .expect("Failed to delete conditions");
    conn.execute("DELETE FROM rolls_changes", ())
        .expect("Failed to delete rolls_changes");
    conn.execute("DELETE FROM ability_scores_changes", ())
        .expect("Failed to delete ability_scores_changes");
    conn.execute("DELETE FROM character_info_changes", ())
        .expect("Failed to delete character_info_changes");

    //adding new ones
    for condition in new_conditions {
        // conditions.push(DatabaseCondition {
        //     name: condition.name,
        //     turn_based: condition.turn_based,
        //     length: condition.length,
        // });
        conn.execute(
            "INSERT INTO conditions(name,turn_based,length) VALUES((?1),(?2),(?3))",
            (
                condition.name.to_owned(),
                condition.turn_based,
                condition.length,
            ),
        )
        .expect("failed to add condition");
        for ability_change in condition.ability_scores_changes {
            conn.execute(
                "INSERT INTO ability_scores_changes(condition,name,change_effect) VALUES((?1),(?2),(?3))",
                (condition.name.to_owned(),ability_change.name,ability_change.change_effect),
            )
            .expect("failed to add ability_scores_changes");
        }
        for roll_change in condition.rolls_changes {
            conn.execute(
                "INSERT INTO rolls_changes(condition,name,change_effect) VALUES((?1),(?2),(?3))",
                (
                    condition.name.to_owned(),
                    roll_change.name,
                    roll_change.change_effect,
                ),
            )
            .expect("failed to add rolls_changes");
        }
        for character_change in condition.character_info_changes {
            conn.execute(
                "INSERT INTO character_info_changes(condition,name,change_effect) VALUES((?1),(?2),(?3))",
                (condition.name.to_owned(),character_change.name,character_change.change_effect),
            )
            .expect("failed to add character_info_changes");
        }
    }
    Ok(())
}
//TODO overwrite conditions
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
fn grab_character_info() -> Result<Vec<CharacterInfo>, ()> {
    let conn = Connection::open("userPage").unwrap();
    let query = "SELECT * FROM characterInfo";
    let mut stmt = conn.prepare(&query).unwrap();
    let mut rows = stmt.query([]).unwrap();
    let mut character_info_list: Vec<CharacterInfo> = Vec::new();
    while let Some(row) = rows.next().unwrap() {
        character_info_list.push(CharacterInfo {
            info_type: row.get(0).unwrap(),
            input: row.get(1).unwrap(),
        });
    }
    Ok(character_info_list)
}
#[tauri::command]
fn grab_conditions() -> Result<Vec<Condition>, ()> {
    let conn = Connection::open("userPage").unwrap();
    let query = "SELECT * FROM conditions";
    let mut stmt = conn.prepare(&query).unwrap();
    let mut rows = stmt.query([]).unwrap();
    let mut condition_list: Vec<Condition> = Vec::new();
    while let Some(row) = rows.next().unwrap() {
        condition_list.push(Condition {
            name: row.get(0).unwrap(),
            turn_based: row.get(1).unwrap(),
            length: row.get(2).unwrap(),
            rolls_changes: Vec::new(),
            ability_scores_changes: Vec::new(),
            character_info_changes: Vec::new(),
        });
    }

    let query = "SELECT * FROM rolls_changes";
    let mut stmt = conn.prepare(&query).unwrap();
    let mut rows = stmt.query([]).unwrap();
    let mut rolls_changes: Vec<DatabaseChange> = Vec::new();
    while let Some(row) = rows.next().unwrap() {
        rolls_changes.push(DatabaseChange {
            condition: row.get(0).unwrap(),
            name: row.get(1).unwrap(),
            change_effect: row.get(2).unwrap(),
        });
    }

    let query = "SELECT * FROM ability_scores_changes";
    let mut stmt = conn.prepare(&query).unwrap();
    let mut rows = stmt.query([]).unwrap();
    let mut ability_scores_changes: Vec<DatabaseChange> = Vec::new();
    while let Some(row) = rows.next().unwrap() {
        ability_scores_changes.push(DatabaseChange {
            condition: row.get(0).unwrap(),
            name: row.get(1).unwrap(),
            change_effect: row.get(2).unwrap(),
        });
    }

    let query = "SELECT * FROM character_info_changes";
    let mut stmt = conn.prepare(&query).unwrap();
    let mut rows = stmt.query([]).unwrap();
    let mut character_info_changes: Vec<DatabaseChange> = Vec::new();
    while let Some(row) = rows.next().unwrap() {
        character_info_changes.push(DatabaseChange {
            condition: row.get(0).unwrap(),
            name: row.get(1).unwrap(),
            change_effect: row.get(2).unwrap(),
        });
    }
    //combine lists
    for condition in &mut condition_list {
        //rolls
        for i in 0..rolls_changes.len() {
            let roll = rolls_changes[i].clone();
            if rolls_changes[i].condition == condition.name {
                condition.rolls_changes.push(Change {
                    name: roll.name,
                    change_effect: roll.change_effect,
                });
            }
        }
        //ability scores
        for i in 0..ability_scores_changes.len() {
            let score = ability_scores_changes[i].clone();
            if score.condition == condition.name {
                condition.ability_scores_changes.push(Change {
                    name: score.name,
                    change_effect: score.change_effect,
                });
            }
        }
        //character info
        for i in 0..character_info_changes.len() {
            let character_info = character_info_changes[i].clone();
            if character_info.condition == condition.name {
                condition.character_info_changes.push(Change {
                    name: character_info.name,
                    change_effect: character_info.change_effect,
                });
            }
        }
    }

    Ok(condition_list)
}
//Vec<Condition>,
#[tauri::command]
fn get_lists() -> Result<
    (
        Vec<Roll>,
        Vec<AbilityScore>,
        Vec<CharacterInfo>,
        Vec<Condition>,
    ),
    (),
> {
    let conn = Connection::open("userPage").unwrap();
    establish_sql(&conn); //if not already set up
    let rolls = grab_rolls()?;
    let ability_scores = grab_ability_scores()?;
    let character_info_list = grab_character_info()?;
    let conditions = grab_conditions()?;
    return Ok((rolls, ability_scores, character_info_list, conditions));
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_lists,
            overwrite_ability_scores,
            overwrite_character_info,
            overwrite_rolls,
            overwrite_conditions,
            grab_ability_scores,
            grab_character_info,
            grab_rolls,
            grab_conditions,
            get_file_path_by_file_dialog,
            get_data_from_excel
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
fn establish_sql(conn: &Connection) {
    conn.execute(
        "CREATE TABLE if not exists rolls(
            rollName TEXT PRIMARY KEY,
            defaultRoll TEXT
        )",
        (),
    )
    .unwrap();
    // ability: Strength ||| score 0-20ish
    conn.execute(
        "CREATE TABLE if not exists abilityScores(
            ability TEXT PRIMARY KEY,
            score INTEGER
        )",
        (),
    )
    .unwrap();
    conn.execute(
        "CREATE TABLE if not exists characterInfo(
            info_type TEXT PRIMARY KEY,
            input TEXT
        )",
        (),
    )
    .unwrap();

    //condition
    conn.execute(
        "CREATE TABLE if not exists conditions(
            name TEXT PRIMARY KEY,
            turn_based        Integer,
            length        Integer,
        )",
        (),
    )
    .unwrap();
    conn.execute(
        "CREATE TABLE if not exists rolls_changes(
            condition   TEXT,
            name    TEXT,
            change_effect   Integer,
        )",
        (),
    )
    .unwrap();
    conn.execute(
        "CREATE TABLE if not exists ability_scores_changes(
            condition TEXT,
            name TEXT,
            change_effect   Integer,
        )",
        (),
    )
    .unwrap();
    conn.execute(
        "CREATE TABLE if not exists character_info_changes(
            condition TEXT,
            name TEXT,
            change_effect   Integer,
        )",
        (),
    )
    .unwrap();
}
