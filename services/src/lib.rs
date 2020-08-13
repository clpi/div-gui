
pub mod request;
pub mod store;
pub mod util;
pub mod models;

pub fn parse(input: String) -> Result<String, String> {
    println!("{}", input);

    input.bytes().into_iter().map(|byte| {
        byte
    }).collect::<Vec<u8>>();
    

    Ok(input)
}

pub fn predict_next(input: String) -> Result<String, String> {
    Ok(input)
}

pub fn write(file: String) -> std::io::Result<()> {
    println!("");
    Ok(())
}

pub enum Node {
    Int(i32),
    Word(String),
    Paren(String),
    UnaryExp {
        Operator: Operator,
        Subj: Box<Node>,
    },
    BinaryExp {
        Operator: Operator,
        LeftSubj: Box<Node>,
        RightSubj: Box<Node>,
    }
}

pub struct Ast {

}

impl Ast {
    pub fn new() {
        create_node!(Literal);
    }
}

pub trait AstNode {}

pub enum Operator {
    Plus,
    Minus,
}

pub mod macros {

    #[macro_export]
    macro_rules! create_node {
        ($($name:ty,)*) => {
            $(
                impl AstNode for $name {
                    fn name() {}
                }
            )*
        };
    }

    #[macro_export]
    macro_rules! test {
        ($($name:ident,)*) => {
            $(

            )*
        };
    }
}

pub mod html {
    
}
