const mailerConfig = {
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.USER_CONFIG,
    pass: process.env.PASSWORD_CONFIG,
  },
};

export default mailerConfig;
