use reqwest::{RequestBuilder, Client, Request};
use tokio::*;
use crate::cmd::{Cmd, Cmd::*};
use std::time::*;
use std::{fs::{File, read, write, read_to_string}, io::Write};
use tauri::api::{
    path::{home_dir, cache_dir, data_dir, config_dir},
    http::*, dir::{read_dir, with_temp_dir},
    notification::*, dialog::{message, ask, save_file, pick_folder},
    rpc::{format_callback, format_callback_result}, file::{Move, Extract, read_string, read_binary},
};
use tauri::api::http::*;
use tauri::{Webview, WebviewMut};
use crate::types::*;

pub fn handle_cmd(webview:&mut Webview, cmd: Cmd) -> Result<(), String> {
    match cmd {
        LogEvent { event, payload } => {
            println!("{}: {:?}", event, payload);
        },
        Login { user } => { 
            tauri::execute_promise(webview, move || {
                println!("Logging in user with username {}", user.username);
                let res = login(user).unwrap(); 
                let ret = format!(" {{ key: 'login', value: {} }}", res);
                Ok(ret)
            },
                "callback".to_string(),
                "Couldn't login user".to_string()
        )},
        Register { user } => { 
            tauri::execute_promise(webview, move || {
                println!("Registering user with username {}", user.username);
                let user = register(user).unwrap();
                let ret = format!(" {{ key: 'user', value: {} }}", user);
                Ok(ret)
            },
                "callback".to_string(),
                "Couldn't login user".to_string()
        )},
        GetUserData { uid } => {
            tauri::execute_promise(webview, move || {
                println!("Getting user with id {}", uid);
                let user = get_user_data(uid).unwrap();
                let ret = format!(" {{ key: 'user', value: {} }}", user);
                Ok(ret)
            },
                "callback".to_string(),
                "Couldn't get user".to_string())
        },
        GetAllUsers { callback, error }=> {
            tauri::execute_promise(webview, move || {
                println!("Getting all users");
                let users = get_all_users().expect("Couldn't get users");
                println!("{}", users);
                Ok(users)
            },
                callback,
                error,
            )
        },
        RequestData { endpoint, body, callback, error } => {
            tauri::execute_promise(webview, move || {
                println!("Requesting {} with {:?}", endpoint, body);
                let req = HttpRequestBuilder::new("GET", endpoint)
                    .body(serde_json::to_value(&body).unwrap())
                    .body_type(BodyType::Auto)
                    .build();
                let res = make_request(req).unwrap();
                let ret = format!("{{ key: 'resp', value: {} }}", res);
                Ok(ret)
            },
                callback, error
            )
        }
        PageChanged { uid } => {
            tauri::api::dialog::message("Hello", format!("susp {}", uid));
            tauri::api::notification::Notification::new()
                .body("Hello").title("Sup").show().unwrap();
        }
        ChooseFolder => {
            let x = make_request(HttpRequestBuilder::new("GET", "http://localhost:3001/api/all").build()).unwrap().to_string();
            println!("{}", x);
            tauri::spawn(|| {
                let d = tauri::api::dialog::pick_folder(home_dir()).unwrap();
            })
        },
        ClickedBtn => {},
        _ => { println!("Other event...") },
  }
  Ok(())
}

pub fn register(user: UserRegister) -> Result<String, std::io::Error> {
    let req = HttpRequestBuilder::new("POST", "http://localhost:3001/api/auth/register")
        .body(serde_json::to_value(&user).unwrap())
        .body_type(BodyType::Auto)
        .build();
    let res = make_request(req).unwrap().to_string();
    Ok(res)
}

pub fn get_user_data(uid: i32) -> Result<String, std::io::Error> {
    let req = HttpRequestBuilder::new("GET", format!("http://localhost:3001/api/user/id/{}", uid))
        .body_type(BodyType::Auto)
        .build();
    let res = make_request(req).unwrap().to_string();
    Ok(res)
}

// to impl
pub fn get_all_users() -> Result<String, String> {
    println!("HELLO!");
    tauri::spawn(move || {
        println!("hello!");
    });
    let req = HttpRequestBuilder::new("GET", format!("http://localhost:3001/api/all"))
        .build();
    let res = make_request(req).unwrap().to_string();
    Ok(res)
}

pub fn login(user: UserLogin) -> tauri::Result<String> {
    let req = HttpRequestBuilder::new("POST", "http://localhost:3001/api/auth/login")
        .body(serde_json::to_value(&user).unwrap())
        .body_type(BodyType::Auto)
        .build();
    match make_request(req) {
        Ok(res) => Ok(res.to_string()),
        Err(_) => Ok("".to_string())
    }
}

pub fn write_cache(path: &str, data: String) -> std::io::Result<()> {
    if let Some(mut cache) = cache_dir() {
        cache.push(path);
        if let Ok(mut file) = File::create(cache) {
            file.write_all(data.as_bytes())
                .expect("Could not write to cache");
        }
    }
    Ok(())
}

pub fn read_cache(path: &str) -> std::io::Result<String> {
    let mut data = String::new();
    if let Some(mut cache) = cache_dir() {
        cache.push(path);
        data = read_to_string(cache).expect("Could not read from cache");
    }
    Ok(data)
}

pub fn gen_request(url: &str, file: &str) -> Result<String, String> {
    if let Ok(data) = make_request(HttpRequestBuilder::new("GET", url).build()) {
        write_cache(file, data.to_string());
        Ok(data.to_string())
    } else {
        Ok(read_cache(file).expect("Could not read cache"))
    }
}

