use neon::prelude::*;

pub trait AstNode {
    fn name() {}
}

fn parse(mut cx: FunctionContext) -> JsResult<JsString> {
    let fun = cx.argument::<JsFunction>(0)?;
    let start = std::time::Instant::now();
    let mut chain = markov::Chain::<String>::new();
    let input = cx.argument::<JsString>(0)?;
    let dur = std::time::Instant::now().duration_since(start);
    Ok(cx.string("hello node"))
}



macro_rules! ast_node {
    ($($name:ty,)*) => {
        $(
            impl AstNode for $name {
                fn name() {}
            }
        )*
    };
}

register_module!(mut cx, {
    cx.export_function("parse", parse)
});
