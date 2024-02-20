// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use rand::prelude::*;
use rusqlite::Connection;
use serde::{Deserialize, Serialize};
use std::{thread::sleep, time::Duration};
use thirtyfour::prelude::*;
use undetected_chromedriver::chrome;
//a made up google account to share it with
const EMAIL: &str = "pdev8951@gmail.com";
const PASSWORD: &str = "k7@5$Qr)X,D7+YA";

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
#[tauri::command]
async fn grab_url(url: &str) -> Result<String, ()> {
    println!("Hello, {}!", url);
    let driver = chrome().await.unwrap();
    driver.goto(url).await.unwrap();
    //wait for the javascript to load
    sleep(Duration::from_secs(thread_rng().gen_range(0..3)));
    //Ok("Google Sheets: Sign-in")
    //gotta sign in
    if driver.title().await.unwrap() == "Google Sheets: Sign-in" {
        panic!("sign in required");
        // let emailField = driver.find(By::Id("identifierId")).await.unwrap();
        // let nextButton = driver.find(By::Id("identifierNext")).await.unwrap();
        // driver
        //     .action_chain()
        //     .send_keys_to_element(&emailField, EMAIL);

        // sleep(Duration::from_secs(2));
        // driver
        //     .action_chain()
        //     .move_to_element_center(&nextButton)
        //     .move_by_offset(thread_rng().gen_range(-5..5), thread_rng().gen_range(-5..5))
        //     .click();
        // println!("{:?}", driver.title().await);
        // sleep(Duration::from_secs(2));
        // let passField = driver.find(By::Id("password")).await.unwrap().;
        // driver.action_chain().move_to_element_center(&passField)
    }
    let wholePage: String = driver.source().await.expect("error unwraping whole page");
    let split1: Vec<&str> = wholePage.split("resizeApp();").collect();
    let startOfScript: String = split1[1].to_owned();
    let split2: Vec<&str> = startOfScript.split("loadWaffle()").collect();
    let scriptString = split2[0];
    println!("output: |{}|", scriptString);

    if wholePage.contains("Accel World") {
        println!("YOUVE DONE IT YOU SICK BASSTAED")
    }
    //let title = driver.title().await.unwrap();
    //println!("Title: {}", title);

    driver.quit().await.unwrap();
    return Ok("Finished waiting".to_owned());
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            grab_url,
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
