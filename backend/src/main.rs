use std::{fs::File, io::Read};

use chrono::{DateTime, Datelike, Utc};
use rocket::http::{ContentType, Status};

use chrono_tz::{Europe::Berlin, Tz};

const DECEMBER: u32 = 12;

#[rocket::launch]
fn rocket() -> _ {
    rocket::build().mount("/unlock", rocket::routes![unlock])
}

#[rocket::get("/<day>")]
fn unlock(day: u32) -> Result<(ContentType, Vec<u8>), Status> {
    if !validate_day(day) {
        return Err(Status::Forbidden);
    }

    let filename = format!("./images/{}.png", day);
    let mut file = File::open(filename).map_err(|_| Status::NotFound)?;
    let mut buf = Vec::new();
    file.read_to_end(&mut buf)
        .ok()
        .ok_or(Status::InternalServerError)?;
    Ok((ContentType::PNG, buf))
}

fn validate_day(day: u32) -> bool {
    let datetime: DateTime<Tz> = Utc::now().with_timezone(&Berlin);
    let current_month = datetime.month();
    let current_day = datetime.day();

    current_month == DECEMBER && day <= current_day
}
