const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.MONGO_CLIENT}:${process.env.MONGO_PASS}@clusterfree.htbcl.mongodb.net/?retryWrites=true&w=majority&appName=ClusterFree`;


const express = require("express");
const cors = require("cors");
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.send("Hello World");
});


app.get('/layout', (req, res) => {
  const layoutPath = path.resolve(__dirname, 'layout.html');
    res.sendFile(layoutPath, (err) => {
        if (err) {
            console.error('Error serving layout.html:', err);
            res.status(500).send('Error fetching layout file.');
        }
    });
});

function kebabCase(str) {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

function styleToString(styles) {
  if (!styles) return '';
  return Object.entries(styles)
    .map(([key, value]) => `${kebabCase(key)}: ${value}`)
    .join('; ');
}

const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

app.post('/upload', async (req, res) => {
    const emailConfig = req.body;
    try {
        await client.connect();
        const database = client.db('emailBuilder');
        const collection = database.collection('templates');
        await collection.insertOne(emailConfig);
        res.json({ message: 'Email configuration saved successfully.' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save email configuration.'+err });
    } finally {
        await client.close();
    }
});

app.get('/data', async(req, res) => {
  try {
    await client.connect();
    const database = client.db('emailBuilder');
    const collection = database.collection('templates');
    const data = await collection.find({}).toArray();
    console.log(data);
    res.json({ data });
} catch (err) {
    res.status(500).json({ error: 'Failed to save email configuration.'+err });
} finally {
    await client.close();
}
})

app.post('/render', async(req,res) => {
    const template = req.body;
    let layoutHtml = path.resolve(__dirname, 'layout.html');

    console.log(template);

    fs.readFile(layoutHtml, 'utf8', (err, layoutHtml) => {
        if (err) {
            console.error('Error reading layout.html:', err);
            return res.status(500).send('Error loading template');
        }

        layoutHtml = layoutHtml
            .replace(/{{title}}/g, template.title || 'Default Title')
            .replace(/{{content}}/g, template.content || 'Default Content');

            const sectionsHtml = (template.sections || []).map((section) => {
              if (section.type === 'text') {
                return `<div style="${styleToString(section.styles)}">${section.content}</div>`;
              } else if (section.type === 'button') {
                return `<a href="#" class="button" style="${styleToString(section.styles)}">${section.content}</a>`;
              } else if (section.type === 'divider') {
                return '<hr class="divider">';
              }
              return '';
            }).join('\n');

            layoutHtml = layoutHtml.replace(/{{#each sections}}[\s\S]*?{{\/each}}/g, sectionsHtml);

        res.send(layoutHtml);
      })

});


  async function run() {
    try {
      await client.connect();
      await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
      await client.close();
    }
  }
  run().catch(console.dir);

app.listen(PORT, () => {
    console.log('Server is running on port: ' + PORT);
})