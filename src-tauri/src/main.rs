// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use rusqlite::Connection;
use serde::{Deserialize, Serialize};
//these need to be this capitalization to be properly turned in tsx object
#[derive(Serialize, Deserialize)]
struct ActionType {
    id: String,
    name: String,
    limits: Vec<ActionLimit>,
}
#[derive(Serialize, Deserialize)]
struct ActionLimit {
    time: i8,
    active: bool,
    #[serde(rename = "useCount")]
    use_count: i32,
    #[serde(rename = "timeCount")]
    time_count: i32,
}

#[derive(Serialize, Deserialize)]
struct GetListsResult {
    rolls: Vec<Roll>,
    #[serde(rename = "abilityScores")]
    ability_scores: Vec<AbilityScore>,
    #[serde(rename = "characterInfo")]
    character_info: Vec<CharacterInfo>,
    conditions: Vec<Condition>,
    #[serde(rename = "actionTypes")]
    action_types: Vec<ActionType>,
}

// name: string;
// roll: string;
// healthCost: string;
// manaCost: string;
// actionTypes: ActionType[];
// conditions: Condition[];

#[derive(Serialize, Deserialize)]
struct Roll {
    id: String,
    name: String,
    roll: String,
    #[serde(rename = "healthCost")]
    health_cost: String,
    #[serde(rename = "manaCost")]
    mana_cost: String,
    #[serde(rename = "actionTypes")]
    action_types: Vec<String>,
    conditions: Vec<String>,
}
#[derive(Serialize, Deserialize)]
struct CharacterInfo {
    #[serde(rename = "infoType")]
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
    #[serde(rename = "changeEffect")]
    change_effect: String,
}
//left to understand what needs to put
#[derive(Serialize, Deserialize)]
struct Condition {
    id: String,
    name: String,
    #[serde(rename = "turnBased")]
    turn_based: bool,
    length: String,
    #[serde(rename = "rollChanges")]
    rolls_changes: Vec<Change>,
    #[serde(rename = "abilityScoreChanges")]
    ability_scores_changes: Vec<Change>,
    #[serde(rename = "characterInfoChanges")]
    character_info_changes: Vec<Change>,
}

#[tauri::command]
fn overwrite_character_info(character_info_list: Vec<CharacterInfo>) -> Result<(), ()> {
    println!("Overwrite character info started");
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
    println!("Overwrite character info finished");
    Ok(())
}
#[tauri::command]
fn overwrite_ability_scores(ability_scores: Vec<AbilityScore>) -> Result<(), ()> {
    println!("Overwrite ability_scores info started");
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
    println!("Overwrite ability_scores info ended");
    Ok(())
}
#[tauri::command]
fn overwrite_rolls(new_rolls: Vec<Roll>) -> Result<(), ()> {
    println!("Overwrite rolls started");
    let conn = Connection::open("userPage").unwrap();
    //delete all old ones
    conn.execute("DELETE FROM rolls", ())
        .expect("Failed to delete");
    conn.execute("DELETE FROM rollsActionTypes", ())
        .expect("Failed to delete");
    conn.execute("DELETE FROM rollsConditions", ())
        .expect("Failed to delete");
    for roll in new_rolls {
        conn.execute(
            "INSERT INTO rolls(id,name,roll,healthCost,manaCost) VALUES((?1),(?2),(?3),(?4),(?5))",
            (
                roll.id.to_owned(),
                roll.name,
                roll.roll,
                roll.health_cost,
                roll.mana_cost,
            ),
        )
        .expect("failed to add");
        for action_type in roll.action_types {
            conn.execute(
                "INSERT INTO rollsActionTypes(rollID,actionType) VALUES((?1),(?2))",
                (roll.id.to_owned(), action_type),
            )
            .expect("failed to add");
        }

        for condition in roll.conditions {
            conn.execute(
                "INSERT INTO rollsConditions(rollID,condition) VALUES((?1),(?2))",
                (roll.id.to_owned(), condition),
            )
            .expect("failed to add");
        }
    }
    println!("Overwrite rolls finished");
    Ok(())
}
#[tauri::command]
fn overwrite_action_types(new_action_types: Vec<ActionType>) -> Result<(), ()> {
    println!("Started overwriteing action types");
    let conn = Connection::open("userPage").unwrap();
    conn.execute("DROP TABLE IF EXISTS action_types", [])
        .unwrap();
    conn.execute(
        "CREATE TABLE if not exists action_types(id TEXT,name TEXT,time INTEGER,active INTEGER,useCount INTEGER,timeCount INTEGER)",
        [],
    ).unwrap();
    for action in new_action_types {
        for limit in action.limits {
            conn.execute("INSERT INTO action_types(id, name, time,active,useCount,timeCount) VALUES((?1),(?2),(?3),(?4),(?5),(?6))", (
                action.id.to_owned(),
                action.name.to_owned(),
                limit.time,
                limit.active,
                limit.use_count,
                limit.time_count,
            )).unwrap();
        }
    }
    println!("Finished overwriteing action types");
    return Ok(());
}
#[tauri::command]
fn overwrite_conditions(new_conditions: Vec<Condition>) -> Result<(), ()> {
    println!("Overwrite conditions started");
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
        conn.execute(
            "INSERT INTO conditions(id, name,turn_based,length) VALUES((?1),(?2),(?3),(?4))",
            (
                condition.id.to_owned(),
                condition.name,
                condition.turn_based,
                condition.length,
            ),
        )
        .expect("failed to add condition");
        for ability_change in condition.ability_scores_changes {
            conn.execute(
                "INSERT INTO ability_scores_changes(condition,name,change_effect) VALUES((?1),(?2),(?3))",
                (condition.id.to_owned(),ability_change.name,ability_change.change_effect),
            )
            .expect("failed to add ability_scores_changes");
        }
        for roll_change in condition.rolls_changes {
            conn.execute(
                "INSERT INTO rolls_changes(condition,name,change_effect) VALUES((?1),(?2),(?3))",
                (
                    condition.id.to_owned(),
                    roll_change.name,
                    roll_change.change_effect,
                ),
            )
            .expect("failed to add rolls_changes");
        }
        for character_change in condition.character_info_changes {
            conn.execute(
                "INSERT INTO character_info_changes(condition,name,change_effect) VALUES((?1),(?2),(?3))",
                (condition.id.to_owned(),character_change.name,character_change.change_effect),
            )
            .expect("failed to add character_info_changes");
        }
    }
    println!("Overwrite conditions ended");
    Ok(())
}
//TODO overwrite conditions
#[tauri::command]
fn grab_ability_scores() -> Result<Vec<AbilityScore>, ()> {
    println!("grab ability started");
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
    println!("grab ability ended");
    Ok(ability_scores)
}
// export interface Roll {
//     id: string;
//     name: string;
//     roll: string;
//     healthCost: string;
//     manaCost: string;
//     actionTypes: ActionType[];
//     conditions: Condition[];
//   }
struct IdStringArray {
    id: String,
    arr: Vec<String>,
}
#[tauri::command]
fn grab_rolls() -> Result<Vec<Roll>, ()> {
    println!("grab rolls started");
    let conn = Connection::open("userPage").unwrap();
    let query = "SELECT * FROM rolls";
    let mut stmt = conn.prepare(&query).unwrap();
    let mut rows = stmt.query([]).unwrap();
    let mut rolls: Vec<Roll> = Vec::new();
    while let Some(row) = rows.next().unwrap() {
        rolls.push(Roll {
            id: row.get(0).unwrap(),
            name: row.get(1).unwrap(),
            roll: row.get(2).unwrap(),
            health_cost: row.get(3).unwrap(),
            mana_cost: row.get(4).unwrap(),
            action_types: Vec::new(),
            conditions: Vec::new(),
        });
    }
    let query = "SELECT * FROM rollsActionTypes";
    let mut stmt = conn.prepare(&query).unwrap();
    let mut rows = stmt.query([]).unwrap();
    let mut action_type_lists: Vec<IdStringArray> = Vec::new();
    while let Some(row) = rows.next().unwrap() {
        let current_id: String = row.get(0).unwrap();
        let current_action_type: String = row.get(1).unwrap();
        let current_action_type_length = action_type_lists.len();
        if current_action_type_length > 0
            && action_type_lists[current_action_type_length - 1].id == current_id
        {
            action_type_lists[current_action_type_length - 1]
                .arr
                .push(current_action_type);
        } else {
            action_type_lists.push(IdStringArray {
                id: current_id,
                arr: vec![current_action_type],
            })
        }
    }
    let query = "SELECT * FROM rollsConditions";
    let mut stmt = conn.prepare(&query).unwrap();
    let mut rows = stmt.query([]).unwrap();
    let mut condition_list: Vec<IdStringArray> = Vec::new();
    while let Some(row) = rows.next().unwrap() {
        let current_id: String = row.get(0).unwrap();
        let current_condition: String = row.get(1).unwrap();
        let condition_list_length = condition_list.len();
        if condition_list_length > 0 && condition_list[condition_list_length - 1].id == current_id {
            condition_list[condition_list_length - 1]
                .arr
                .push(current_condition);
        } else {
            condition_list.push(IdStringArray {
                id: current_id,
                arr: vec![current_condition],
            })
        }
    }
    //double pointers following both lists to combine
    // combining during pulling would be more efficient but this adds some readability and room to grow (mainly I already wrote it)
    //wrote the cleaner version for grab_action_types, ill come back maybe to fix
    let mut ability_types_index = 0;
    let mut roll_index = 0;
    while ability_types_index < action_type_lists.len() {
        while action_type_lists[ability_types_index].id != rolls[roll_index].id {
            roll_index += 1;
        }
        rolls[roll_index].action_types = action_type_lists[ability_types_index].arr.clone();
        ability_types_index += 1;
    }
    let mut condition_index = 0;
    let mut roll_index = 0;
    while condition_index < condition_list.len() {
        while condition_list[condition_index].id != rolls[roll_index].id {
            roll_index += 1;
        }
        rolls[roll_index].action_types = condition_list[condition_index].arr.clone();
        condition_index += 1;
    }
    println!("grab rolls ended");
    Ok(rolls)
}
#[tauri::command]
fn grab_character_info() -> Result<Vec<CharacterInfo>, ()> {
    println!("grab characterInfo started");
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
    println!("grab characterInfo ended");
    Ok(character_info_list)
}
#[tauri::command]
fn grab_conditions() -> Result<Vec<Condition>, ()> {
    println!("grab conditions started");
    let conn = Connection::open("userPage").unwrap();
    let query = "SELECT * FROM conditions";
    let mut stmt = conn.prepare(&query).unwrap();
    let mut rows = stmt.query([]).unwrap();
    let mut condition_list: Vec<Condition> = Vec::new();
    while let Some(row) = rows.next().unwrap() {
        condition_list.push(Condition {
            id: row.get(0).unwrap(),
            name: row.get(1).unwrap(),
            turn_based: row.get(2).unwrap(),
            length: row.get(3).unwrap(),
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
            if rolls_changes[i].condition == condition.id {
                condition.rolls_changes.push(Change {
                    name: roll.name,
                    change_effect: roll.change_effect,
                });
            }
        }
        //ability scores
        for i in 0..ability_scores_changes.len() {
            let score = ability_scores_changes[i].clone();
            if score.condition == condition.id {
                condition.ability_scores_changes.push(Change {
                    name: score.name,
                    change_effect: score.change_effect,
                });
            }
        }
        //character info
        for i in 0..character_info_changes.len() {
            let character_info = character_info_changes[i].clone();
            if character_info.condition == condition.id {
                condition.character_info_changes.push(Change {
                    name: character_info.name,
                    change_effect: character_info.change_effect,
                });
            }
        }
    }
    println!("grab conditions ended");
    Ok(condition_list)
}

//Vec<Condition>,
#[tauri::command]
fn grab_lists() -> Result<GetListsResult, ()> {
    println!("Started getting Lists");
    let conn = Connection::open("userPage").unwrap();
    establish_sql(&conn); //if not already set up
    let rolls = grab_rolls()?;
    let ability_scores = grab_ability_scores()?;
    let character_info_list = grab_character_info()?;
    let conditions = grab_conditions()?;
    let action_types = grab_action_types()?;
    println!("finished getting Lists");
    return Ok(GetListsResult {
        rolls: rolls,
        ability_scores: ability_scores,
        character_info: character_info_list,
        conditions: conditions,
        action_types: action_types,
    });
}
//CREATE TABLE if not exists action_types(id Text, name TEXT,time INTEGER,active INTEGER,useCount INTEGER,timeCount INTEGER)
#[tauri::command]
fn grab_action_types() -> Result<Vec<ActionType>, ()> {
    println!("grabing action types started");
    let conn = Connection::open("userPage").unwrap();
    let mut action_types: Vec<ActionType> = Vec::new();
    let query = format!("SELECT * FROM action_types");
    let mut stmt = conn.prepare(&query).unwrap();
    let mut rows = stmt.query([]).unwrap();
    //id: 0 name:1
    // limits.push(ActionLimit {
    //     time: row.get(2).unwrap(),
    //     active: row.get(3).unwrap(),
    //     use_count: row.get(4).unwrap(),
    //     time_count: row.get(5).unwrap(),
    // });
    while let Some(row) = rows.next().unwrap() {
        let action_type_len = action_types.len();
        let current_id: String = row.get(0).unwrap();
        let current_limit: ActionLimit = ActionLimit {
            time: row.get(2).unwrap(),
            active: row.get(3).unwrap(),
            use_count: row.get(4).unwrap(),
            time_count: row.get(5).unwrap(),
        };
        if action_type_len > 0 && action_types[action_type_len - 1].id == current_id {
            action_types[action_type_len - 1].limits.push(current_limit)
        } else {
            action_types.push(ActionType {
                id: current_id,
                name: row.get(1).unwrap(),
                limits: vec![current_limit],
            });
        }
    }
    println!("grabing action types ended");
    return Ok(action_types);
}
fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            grab_lists,
            overwrite_ability_scores,
            overwrite_character_info,
            overwrite_rolls,
            overwrite_conditions,
            overwrite_action_types,
            grab_ability_scores,
            grab_character_info,
            grab_rolls,
            grab_conditions,
            grab_action_types,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
// export interface Roll {
//     name: string;
//     roll: string;
//     healthCost: string;
//     manaCost: string;
//     actionTypes: ActionType[];
//     conditions: Condition[];
//   }
fn establish_sql(conn: &Connection) {
    conn.execute(
        "CREATE TABLE if not exists rolls(
            id TEXT PRIMARY KEY,
            name TEXT,
            roll TEXT,
            healthCost TEXT,
            manaCost TEXT
        )",
        (),
    )
    .unwrap();
    conn.execute(
        "CREATE TABLE if not exists rollsActionTypes(
        rollID TEXT,
        actionType TEXT
    )",
        (),
    )
    .unwrap();
    conn.execute(
        "CREATE TABLE if not exists rollsConditions(
        rollID TEXT PRIMARY KEY,
        condition TEXT
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
            id TEXT PRIMARY KEY,
            name,
            turn_based        Integer,
            length        TEXT
        )",
        (),
    )
    .unwrap();
    conn.execute(
        "CREATE TABLE if not exists rolls_changes(
            condition   TEXT,
            name    TEXT,
            change_effect   Integer
        )",
        (),
    )
    .unwrap();
    conn.execute(
        "CREATE TABLE if not exists ability_scores_changes(
            condition TEXT,
            name TEXT,
            change_effect   Integer
        )",
        (),
    )
    .unwrap();
    conn.execute(
        "CREATE TABLE if not exists character_info_changes(
            condition TEXT,
            name TEXT,
            change_effect   Integer
        )",
        (),
    )
    .unwrap();
    conn.execute(
        "CREATE TABLE if not exists action_types(id TEXT,name TEXT,time INTEGER,active INTEGER,useCount INTEGER,timeCount INTEGER)",
        (),
    )
    .unwrap();
}
