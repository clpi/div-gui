#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]
//extern crate divis;
//extern crate services;
pub mod handlers;
pub mod types;

use tauri::api::dialog;
use std::path::Path;
use serde::{Deserialize, Serialize};
use tauri::api::http::*;
use crate::types::*;
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
        webview.clone().dispatch(move |w| {
        }).unwrap();
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
    .invoke_handler(|mut _webview, arg| {
        match serde_json::from_str(arg) {
            Err(e) => {
                Err(e.to_string())
            }
            Ok(cmd) => handlers::handle_cmd(&mut _webview, cmd),
      }
    })
    .build()
    .run();
}
