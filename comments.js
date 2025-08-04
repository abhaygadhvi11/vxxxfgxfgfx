// import { commentSchema } from "../../../../lib/validation/task";
// import { validate } from "../../../../lib/validation/validator";
// import {
//   addCommentToTask,
//   getComment,
// } from "../../../../lib/services/taskService";
// import { authenticate } from "../../../../lib/auth";

// async function handler(req, res) {
//   const { id: taskId } = req.query;
//   const user = req.user;

//   try {
//     if (req.method === "POST") {
//       const errors = validate(commentSchema, req.body);
//       if (errors) {
//         return res.status(400).json({ success: false, errors });
//       }

//       const commentData = {
//         content: req.body.content,
//         userId: user.id,
//       };

//       try {
//         const comment = await addCommentToTask(taskId, commentData);
//         if (!comment) {
//           return res.status(404).json({ error: "Task not found" });
//         }

//         return res.status(201).json({ success: true, comment });
//       } catch (error) {
//         console.error(error);
//         return res.status(500).json({ error: "Failed to create comment" });
//       }
//     }

//     // Get Comment of Particular Task
//     if (req.method === "GET") {
//       try {
//         const comment = await getComment(taskId);
//         if (comment.length === 0) {
//           return res.status(200).json({ message: "No Comments Regarding to Task" });
//         }

//         return res.status(200).json({ success: true, comment });
//       } catch (error) {
//         console.error(error);
//         return res.status(500).json({ error: "Failed to get comment list" });
//       }
//     }
//     return res.status(405).json({ message: "Method Not Allowed" });
//   } catch (error) {
//     console.error("Handler error:", error);
//     return res.status(500).json({ error: "Internal Error" });
//   }
// }

// export default authenticate(handler);


import { commentSchema } from "../../../../lib/validation/task";
import { validate } from "../../../../lib/validation/validator";
import {
  addCommentToTask,
  getComment,
} from "../../../../lib/services/taskService";
import { withAuth } from "../../../../lib/auth"; 

async function handler(req, res) {
  const { id: taskId } = req.query;
  const user = req.user;

  try {
    if (req.method === "POST") {
      const errors = validate(commentSchema, req.body);
      if (errors) {
        return res.status(400).json({ success: false, errors });
      }

      const commentData = {
        content: req.body.content,
        userId: user.id,
      };

      try {
        const comment = await addCommentToTask(taskId, commentData);
        if (!comment) {
          return res.status(404).json({ error: "Task not found" });
        }

        return res.status(201).json({ success: true, comment });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to create comment" });
      }
    }

    if (req.method === "GET") {
      try {
        const comment = await getComment(taskId);
        if (comment.length === 0) {
          return res.status(200).json({ message: "No Comments Regarding to Task" });
        }

        return res.status(200).json({ success: true, comment });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to get comment list" });
      }
    }

    return res.status(405).json({ message: "Method Not Allowed" });
  } catch (error) {
    console.error("Handler error:", error);
    return res.status(500).json({ error: "Internal Error" });
  }
}

export default withAuth(handler);
