use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
#[serde(tag = "cmd", rename_all = "camelCase")]
pub enum Cmd {
    LogEvent { event: String, payload: Option<String> },
    Login { user: UserLogin },
    Register { user: UserRegister },
    GetUserData {  uid: i32 },
    RequestData { endpoint: String, body: String, callback: String, error: String },
    GetAllUsers,
    ChooseFolder,
    ClickedBtn,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UserLogin {
    pub username: String,
    pub password: String,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UserRegister {
    pub email: String,
    pub username: String,
    pub password: String,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct User {
    id: i32,
    username: String,
    email: String,
    password: String,
    createdAt: i32,
}
