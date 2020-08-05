#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]
//extern crate divis;
//extern crate services;

use tauri::api::dialog;
use std::path::Path;
use tauri::api::http::*;
use cmd::*;

mod cmd;

fn main() {
  tauri::AppBuilder::new()
    //.splashscreen_html("<div>hi</div>")
    .invoke_handler(|_webview, arg| {
      use cmd::Cmd::*;
      match serde_json::from_str(arg) {
        Err(e) => {
          Err(e.to_string())
        }
        Ok(command) => {
          match command {
              cmd::Cmd::Login(user_login) => {
                  login(user_login).unwrap();
              },
            cmd::Cmd::Register(user_register) => {
                register(user_register).unwrap()
            },
            cmd::Cmd::GetUserData(uid) => {
                let user = get_user_data(uid).unwrap();
                // how to send it back... hmmm...
            },
            cmd::Cmd::ChooseFolder => {},
            cmd::Cmd::ClickedBtn => {},
          }
          Ok(())
        }
      }
    })
    .build()
    .run();
}

pub fn register(user: UserRegister) -> Result<(), std::io::Error> {
    let req = HttpRequestBuilder::new("POST", "http://localhost:3001/api/auth/register")
        .body(serde_json::to_value(&user).unwrap())
        .body_type(BodyType::Auto)
        .build();
    let res = make_request(req);
    Ok(())
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

