const request = require("supertest");
const app = require("../../src/app");
const mongoose = require("mongoose");
const path = require("path");

const Task = mongoose.model("task");

beforeAll(() => Task.deleteMany());

afterAll(() => mongoose.disconnect());

let userToken = "";
let userId  =""
describe("Tasks init Tests", () => {
  test("Tasks test route", async () => {
    const res = await request(app).get("/task/test");

    expect(res.statusCode).toEqual(200);
  });

  test("login user", async () => {
    const res = await await request(app).post("/auth/user/login").send({
      email: "user1@task.com",
      password: "task#123",
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("user");
    expect(res.body).toHaveProperty("token");

    userToken = res.body.token;
    userId = res.body.user._id;
  });
});

describe("tasks manupulation", () => {
  let taskId = ""

  test("add a new task", async () => {

      const res = await  request(app).post("/task/add")
        .set('Authorization',`Bearer ${userToken}`)
        .send({
            title : "mock task",
            completed : false
        });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty("task")

        taskId = res.body.task._id;

  });

  test("get all my tasks", async ()=>{
    const res = await  request(app).get("/task/mytasks")
        .set('Authorization',`Bearer ${userToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('tasks')

        expect(res.body.tasks.every(task => task.owner == userId )).toBeTruthy()
        

  })

  test("toggle complete Status",async()=>{
    const res = await request(app).patch("/task/togglecomplete")
                        .set('Authorization',`Bearer ${userToken}`)
                        .send({
                          id : taskId
                        });

          expect(res.statusCode).toEqual(200);
          expect(res.body.completed).toBeTruthy()

  })

  test("edit task",async()=>{
    const res = await request(app).patch("/task/edit")
                        .set('Authorization',`Bearer ${userToken}`)
                        .send({
                          id : taskId,
                          title : "new title 1"
                        });

                        expect(res.statusCode).toEqual(200);
                        expect(res.body.title).toEqual("new title 1")
              
  })

  test("Delete task",async()=>{
    const res = await request(app).delete("/task/deleteTask")
                        .set('Authorization',`Bearer ${userToken}`)
                        .send({
                          id : taskId,
                        });

                        expect(res.statusCode).toEqual(200);
                        expect(res.body.message).toEqual("success")
              
  })

});
