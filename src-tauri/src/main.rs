// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use rusqlite::Connection;
use serde::{Deserialize, Serialize};

// "CREATE TABLE if not exists rolls(
// rollName    TEXT PRIMARY KEY,
// defaultRoll TEXT,
// rollType    TEXT

// "CREATE TABLE if not exists abilityScores(
// ability    TEXT PRIMARY KEY,
// score      INTEGER,
#[derive(Serialize, Deserialize)]
struct Roll {
    roll_name: String,
    default_roll: String,
    roll_type: String,
}
#[derive(Serialize, Deserialize)]
struct AbilityScore {
    ability: String,
    score: i8,
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
            roll_type: row.get(2).unwrap(),
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
            roll_type: row.get(2).unwrap(),
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
            grab_ability_scores,
            grab_rolls
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
fn establish_sql(conn: &Connection) {
    let _ = conn
        .execute(
            "CREATE TABLE if not exists rolls(
            rollName    TEXT PRIMARY KEY,
            defaultRoll TEXT,
            rollType    TEXT
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
