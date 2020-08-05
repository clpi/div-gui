use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
#[serde(tag = "cmd", rename_all = "camelCase")]
pub enum Cmd {
  Login(UserLogin),
  Register(UserRegister),
  GetUserData(i32),
  ChooseFolder,
  ClickedBtn,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UserLogin {
    username: String,
    password: String,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UserRegister {
    email: String,
    username: String,
    password: String,
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
