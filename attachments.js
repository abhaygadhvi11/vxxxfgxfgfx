import multer from "multer";
import path from "path";
import fs from "fs";
import { addAttachmentToTask, getAttachments } from "../../../../lib/services/fileUploadService";
import { authenticate } from "../../../../lib/auth";

const uploadDir = path.join(process.cwd(), "public/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const allowFile = (req, file, cb) => {
  const allowedTypes = /jpeg|txt|jpg|png|pdf|doc|docx/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only (jpeg, txt, png, pdf, doc, docx) these extentions are allowed"));
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  fileFilter: allowFile,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadMiddleware = upload.single("file");

// Helper to run middleware
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

// Main API handler 
async function handler(req, res) {
  const { id: taskId } = req.query;

  if (req.method === "POST") {
    try {
      await runMiddleware(req, res, uploadMiddleware);
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const attachments = await addAttachmentToTask(taskId, req.file);
      return res.status(201).json({ success: true, attachment: attachments });
    } catch (err) {
      console.error("Upload error:", err);
      return res.status(500).json({ error: `Error uploading file: ${err.message}` });
    }
  }

  if (req.method === "GET") {
    try {
      const attachments = await getAttachments(taskId);
      if(attachments.length == 0) return res.status(201).json({ sorry: "No Attachments Regarding to Task" });
      return res.status(200).json({ success: true, attachments });
    } catch (err) {
      return res.status(500).json({ error: "Failed to fetch attachments" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default authenticate(handler);


// import multer from "multer";
// import path from "path";
// import fs from "fs";
// import { addAttachmentToTask, getAttachments } from "../../../../lib/services/fileUploadService";
// import { authenticate } from "../../../../lib/auth";


// const uploadDir = path.join(process.cwd(), "public/uploads");
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }


// const allowFile = (req, file, cb) => {
//   const allowedTypes = /jpeg|txt|jpg|png|pdf|doc|docx/;
//   const ext = path.extname(file.originalname).toLowerCase();
//   if (allowedTypes.test(ext)) {
//     cb(null, true);
//   } else {
//     cb(new Error("Only (jpeg, txt, png, pdf, doc, docx) file types are allowed"));
//   }
// };


// const { diskStorage } = require("multer");

// const storage = diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, uploadDir);
//   },
//   filename: function (req, file, cb) {
//     const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
//     cb(null, uniqueName);
//   },
// });

// const upload = multer({
//   storage,
//   fileFilter: allowFile,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
// });

// const uploadMiddleware = upload.single("file");


// function runMiddleware(req, res, fn) {
//   return new Promise((resolve, reject) => {
//     fn(req, res, (err) => {
//       if (err) reject(err);
//       else resolve();
//     });
//   });
// }


// async function handler(req, res) {
//   const { id: taskId } = req.query;

//   if (req.method === "POST") {
//     try {
//       await runMiddleware(req, res, uploadMiddleware);

//       if (!req.file) {
//         return res.status(400).json({ error: "No file uploaded" });
//       }

//       const attachments = await addAttachmentToTask(taskId, req.file);
//       return res.status(201).json({ success: true, attachment: attachments });
//     } catch (err) {
//       console.error("Upload error:", err);
//       return res.status(500).json({ error: `Error uploading file: ${err.message}` });
//     }
//   }

//   if (req.method === "GET") {
//     try {
//       const attachments = await getAttachments(taskId);
//       if (attachments.length === 0) {
//         return res.status(200).json({ message: "No attachments found for this task" });
//       }
//       return res.status(200).json({ success: true, attachments });
//     } catch (err) {
//       return res.status(500).json({ error: "Failed to fetch attachments" });
//     }
//   }

//   return res.status(405).json({ error: "Method not allowed" });
// }


// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// export default authenticate(handler);
