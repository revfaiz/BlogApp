import express from 'express';
import dotenv from 'dotenv';
import blogRouter from './route/blog.js';



const app = express();
dotenv.config();


app.listen(process.env.PORT, () => {
    console.log(`User service is running on: http://localhost:${process.env.PORT}`);
});

app.use('/api/v1', blogRouter);
app.get('/', (req, res) => {
    res.send('Hello World!');
});