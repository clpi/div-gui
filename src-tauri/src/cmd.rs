use serde::{Deserialize, Serialize};
use common::models::{User, Record, Item};
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
    ChooseFolder,
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
