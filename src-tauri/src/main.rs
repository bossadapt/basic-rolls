mod lib;
#[cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
fn main() {
    lib::run();
  }