require('dotenv').config();
const url = process.env.DATABASE_URL;
if (!url) {
  console.log('DATABASE_URL is not set');
} else {
  console.log('DATABASE_URL is set');
  if (url.includes('schema=')) {
    console.log('WARNING: DATABASE_URL contains "schema" parameter');
    console.log(
      'This might be causing the "unrecognized configuration parameter" error.',
    );
  } else {
    console.log('DATABASE_URL does not contain "schema" parameter');
  }
  if (url.includes('pgbouncer=true')) {
    console.log('DATABASE_URL contains "pgbouncer=true"');
  } else {
    console.log('DATABASE_URL does not contain "pgbouncer=true"');
  }
}
