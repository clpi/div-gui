use serde::{Deserialize, Serialize};
use services::models::{UserLogin, UserRegister};
use common::models::{User, Item,  Record};
use crate::types::*;

#[derive(Deserialize)]
#[serde(tag = "cmd", rename_all = "camelCase")]
pub enum Cmd {
    LogEvent { event: String, payload: Option<String> },
    Login { user: UserLogin },
    Register { user: UserRegister },
    GetUserData { uid: i32 },
    PageChanged { uid: i32 },
    RequestData { endpoint: String, body: String, callback: String, error: String },
    GetAllUsers { callback: String, error: String },
    AddRecord { record: Record },
    AddItem { item: Item },
    ParseText { text: String },
    InputUpdated { input: String },
    ChooseFolder,
    OpenFile { path: String },
    SaveFile { path: String, data: String },
    ClickedBtn,
}


//#[derive(Serialize, Deserialize)]
//#[serde(rename_all = "camelCase")]
//pub struct User {
    //id: i32,
    //username: String,
    //email: String,
    //password: String,
    //createdAt: i32,
//}
//
