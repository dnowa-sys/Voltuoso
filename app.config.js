import 'dotenv/config'; // this runs only at build time, in Node
export default {
  expo: {
    name: 'Voltuoso',
    slug: 'voltuoso',
    version: '1.0.0',
    extra: {
      API_URL: process.env.API_URL,
      // any other secrets…
    },
  },
};
