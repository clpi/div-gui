#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]
//extern crate divis;
//extern crate services;

use tauri::api::dialog;
use std::path::Path;
use serde::{Deserialize, Serialize};
use tauri::api::http::*;
use cmd::*;

mod cmd;


#[derive(Serialize)]
pub struct Response {
    data: String,
}

fn main() {
    tauri::AppBuilder::new()
    .setup(|webview, _source| {
        let mut webview = webview.as_mut();
        let mut webview_clone = webview.clone();
        tauri::event::listen("store-js".to_string(), move |msg| {
            println!("Got event: {:?}", msg);
            let reply = Response { data: "Msg received".to_string() };
            
            tauri::event::emit(
                &mut webview, "store-rs".to_string(),
                Some(serde_json::to_string(&reply).unwrap())
            )
                .expect("Failed to emit");
        });

        webview_clone
            .dispatch(move |w| {  })
            .expect("Failed to dispatch");
      })
    .invoke_handler(|_webview, arg| {
        use cmd::Cmd::*;
        match serde_json::from_str(arg) {
            Err(e) => {
                Err(e.to_string())
            }
            Ok(command) => {
                match command {
                    LogEvent { event, payload } => {
                        println!("{}: {:?}", event, payload);
                    },
                    Login { user } => { 
                        tauri::execute_promise(_webview, move || {
                            println!("Logging in user with username {}", user.username);
                            let res = login(user).unwrap(); 
                            let ret = format!(" {{ key: 'login', value: {} }}", res);
                            Ok(ret)
                        },
                            "callback".to_string(),
                            "Couldn't login user".to_string()
                    )},
                    Register { user } => { 
                        tauri::execute_promise(_webview, move || {
                            println!("Registering user with username {}", user.username);
                            let user = register(user).unwrap();
                            let ret = format!(" {{ key: 'user', value: {} }}", user);
                            Ok(ret)
                        },
                            "callback".to_string(),
                            "Couldn't login user".to_string()
                    )},
                    GetUserData { uid } => {
                        tauri::execute_promise(_webview, move || {
                            println!("Getting user with id {}", uid);
                            let user = get_user_data(uid).unwrap();
                            let ret = format!(" {{ key: 'user', value: {} }}", user);
                            Ok(ret)
                        },
                            "callback".to_string(),
                            "Couldn't get user".to_string())
                    },
                    GetAllUsers => {
                        tauri::execute_promise(_webview, move || {
                            println!("Getting all users");
                            let users = get_all_users().unwrap();
                            let ret = format!(" {{ key: 'user', value: {} }}", users);
                            Ok(ret)
                        },
                            "callback".to_string(),
                            "Couldn't get users".to_string())
                    },
                    RequestData { endpoint, body, callback, error } => {
                        tauri::execute_promise(_webview, move || {
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
                    ChooseFolder => {},
                    ClickedBtn => {},
          }
          Ok(())
        }
      }
    })
    .build()
    .run();
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
pub fn get_all_users() -> Result<String, std::io::Error> {
    let req = HttpRequestBuilder::new("GET", "http://localhost:3001/api/all")
        .body_type(BodyType::Auto)
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

