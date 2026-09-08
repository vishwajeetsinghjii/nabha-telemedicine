# Gender registration fix

The PostgreSQL `patients_gender_check` constraint uses canonical values `Female`, `Male`, and `Other`. Registration forms previously submitted uppercase enum values such as `MALE`, causing patient creation to fail.

The frontend now submits canonical database values, and the backend normalizes legacy uppercase values as defense in depth. `PREFER_NOT_TO_SAY` is stored as `Other` because the existing schema has no separate value for it.
