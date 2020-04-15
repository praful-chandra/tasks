const request = require("supertest");
const app = require("../src/app");
const mongoose = require("mongoose");

const User = mongoose.model("user");

beforeAll(() => User.deleteMany());

afterAll(() => mongoose.disconnect());


const user =  {
    _id : new mongoose.Types.ObjectId(),
  name: "Praful",
  email: "user1@task.com",
  password: "task#123",
};

let userToken = "";

describe("Testing the Express App", () => {
  it("request to Root", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toEqual(200);
  });
});

describe("User authentication ", () => {


  test("sigin up", async () => {
    const res = await request(app)
      .post("/auth/user/signup")
      .send(user);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("user");
    expect(res.body).toHaveProperty("token");

    userToken = user.token;
    const userFromDB = await User.findById(user._id);

    expect(userFromDB).not.toBeNull();

  });

  test("SHould not signup with same Email", async () => {
    const res = await request(app)
      .post("/auth/user/signup")
      .send({
        ...user,
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).not.toHaveProperty("user");
    expect(res.body).not.toHaveProperty("token");
    expect(res.body).toHaveProperty("error");

  });

  test("login user", async () => {
    const res = await await request(app).post("/auth/user/login").send({
      email: user.email,
      password: user.password,
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("user");
    expect(res.body).toHaveProperty("token");

    userToken = res.body.token;
  });

  test("should not login with invalid email", async () => {
    const res = await await request(app).post("/auth/user/login").send({
      email: "invalid email",
      password: user.password,
    });

    expect(res.statusCode).toEqual(401);
    expect(res.body).not.toHaveProperty("user");
    expect(res.body).not.toHaveProperty("token");

    expect(res.body).toHaveProperty("error");
  });

  test("should not login with invalid Passeord", async () => {
    const res = await await request(app).post("/auth/user/login").send({
      email: user.email,
      password: "invalid password",
    });

    expect(res.statusCode).toEqual(401);
    expect(res.body).not.toHaveProperty("user");
    expect(res.body).not.toHaveProperty("token");

    expect(res.body).toHaveProperty("error");
  });

  test("validate user", async () => {
    const res = await request(app)
      .post("/auth/user/validateUser")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("user");
  });


  test("Should not validate user if no token", async () => {
    const res = await request(app)
      .post("/auth/user/validateUser")
      .set("Authorization", `Bearer `);

    expect(res.statusCode).toEqual(401);
    expect(res.body).not.toHaveProperty("user");
  });



});
