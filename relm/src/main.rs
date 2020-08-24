pub mod ui;
pub mod win;

use gtk::{
    prelude::*,
    Button, ButtonExt, Orientation, Inhibit
};
use relm::{
    EventStream, Relm, Update, Widget, execute,
    Component, 
};
use relm_derive::{Msg, widget};


fn main() {
    gtk::init().expect("Gtk init failed");
    println!("Hello, world!");
}
