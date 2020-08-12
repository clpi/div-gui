
pub mod request;
pub mod store;
pub mod util;
pub mod models;

pub fn parse(input: String) -> Result<String, String> {
    println!("{}", input);

    Ok(input)
}

pub fn write(file: String) -> std::io::Result<()> {
    println!("");
    Ok(())
}
