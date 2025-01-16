import express, { Express, Request, Response, Application } from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import cors from 'cors';

//For env File 
dotenv.config();

const app: Application = express();
const port = process.env.PORT || 8000;
// app.use(cors({
//     origin: 'https://metruyenmoi.com',  // Only allow this domain
//     methods: ['GET', 'POST'],          // Specify allowed methods
//     allowedHeaders: ['Content-Type', 'Authorization'] // Specify allowed headers
// }));

// app.use((req: any, res: any, next: any) => {
//     const allowedOrigin = 'metruyenmoi.com';
//     const referer = req.get('Referer');
//     const origin = req.get('Origin');
//     if (!origin || !origin.includes(allowedOrigin)) {
//         return res.status(403).send("")
//     }
//     next();
// });

app.get('/*', async (req: Request, res: any) => {
    //    console.log(req["headers"])
    try {
        const path = req.params[0]; // Capture the wildcard route
        const data = req.query.data as string;
        // Decode the Base64 encoded URL
        const url = Buffer.from(data, 'base64').toString('utf-8');

        // Make a GET request to the decoded URL
        const response = await axios.get(url, {
            responseType: 'stream', // Stream the image content
            headers: {
                'Accept': '*/*',
                'User-Agent': 'Mozilla/5.0 (Windows NT 6.2; Win64; x64; en-US) Gecko/20130401 Firefox/53.5',
                'Referer': 'nettruyenviet.com'
            }
        });

        // If the request is not successful, return 404
        if (response.status !== 200) {
            return res.status(404).send('Image not found');
        }

        // Forward the response as a stream with the appropriate content type
        res.setHeader('Content-Type', response.headers['content-type'] || 'application/octet-stream');
        response.data.pipe(res);
    } catch (error) {
        // Handle errors (e.g., decoding failure, network issues)
        res.status(404).send('Image not found');
    }
});

app.listen(port, () => {
    console.log(`Server is Fire at http://localhost:${port}`);
});
