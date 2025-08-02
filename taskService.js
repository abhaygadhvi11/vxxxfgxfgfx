import prisma from "../prisma";

export const getFilteredTasks = async (filters = {}) => {
  try {
    // Ensure required filter properties have defaults
    const safeFilters = {
      page: 1,
      limit: 20,
      sortBy: "createdAt",
      sortOrder: "DESC",
      ...filters,
    };

    const where = buildWhereClause(safeFilters);

    //orderBy clause
    const orderBy = buildOrderByClause(safeFilters);

    const include = buildIncludeClause(safeFilters);

    const skip = (safeFilters.page - 1) * safeFilters.limit;
    const take = safeFilters.limit;

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include,
        orderBy,
        skip,
        take,
      }),
      prisma.task.count({ where }),
    ]);

    return {
      success: true,
      data: tasks,
      pagination: {
        page: safeFilters.page,
        limit: safeFilters.limit,
        total,
        pages: Math.ceil(total / safeFilters.limit),
      },
      filters: getAppliedFilters(safeFilters),
    };
  } catch (error) {
    console.error("Get tasks error:", error);
    throw error;
  }
};

export const createTask = async (data) => {
  return await prisma.task.create({ data });
};

export const updateTask = async (id, data) => {
  return await prisma.task.update({ where: { id }, data });
};

export const deleteTask = async (id) => {
  return await prisma.task.delete({ where: { id } });
};

export const getTaskById = async (id) => {
  return await prisma.task.findUnique({ where: { id } });
};

export const addCommentToTask = async (taskId, commentData) => {
  return await prisma.taskComment.create({
    data: {
      content: commentData.content,
      task: { connect: { id: taskId } },
      user: { connect: { id: commentData.userId } },
    },
  });
};

export const getComment = async (taskId) => {
  return await prisma.taskComment.findMany({ where: { taskId } });
};

function buildWhereClause(filters) {
  const where = {};

  if (filters.status && filters.status.length > 0) {
    where.status = { in: filters.status };
  }

  if (filters.priority && filters.priority.length > 0) {
    where.priority = { in: filters.priority };
  }

  if (filters.assignedToId && filters.assignedToId.length > 0) {
    where.assignedToId = { in: filters.assignedToId };
  }

  if (filters.createdById) {
    where.createdById = filters.createdById;
  }

  if (filters.unassigned) {
    where.assignedToId = null;
  }

  // Handle date filters carefully to avoid conflicts
  const dateConditions = {};

  if (filters.dueDateFrom || filters.dueDateTo) {
    dateConditions.dueDate = {};
    if (filters.dueDateFrom) {
      dateConditions.dueDate.gte = new Date(filters.dueDateFrom);
    }
    if (filters.dueDateTo) {
      dateConditions.dueDate.lte = new Date(filters.dueDateTo);
    }
  }

  if (filters.createdFrom || filters.createdTo) {
    dateConditions.createdAt = {};
    if (filters.createdFrom) {
      dateConditions.createdAt.gte = new Date(filters.createdFrom);
    }
    if (filters.createdTo) {
      dateConditions.createdAt.lte = new Date(filters.createdTo);
    }
  }

  if (filters.overdue) {
    // Only apply if no specific due date filters are set
    if (!dateConditions.dueDate) {
      dateConditions.dueDate = { lt: new Date() };
    } else {
      // Combine with existing due date filter
      dateConditions.dueDate.lt = new Date();
    }
    where.status = { notIn: ["COMPLETED", "CANCELLED"] };
  }

  if (filters.dueSoon) {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    // Only apply if no specific due date filters are set
    if (!dateConditions.dueDate) {
      dateConditions.dueDate = {
        gte: new Date(),
        lte: nextWeek,
      };
    } else {
      // Combine with existing filters
      if (!dateConditions.dueDate.gte) {
        dateConditions.dueDate.gte = new Date();
      }
      if (!dateConditions.dueDate.lte) {
        dateConditions.dueDate.lte = nextWeek;
      }
    }
    where.status = { notIn: ["COMPLETED", "CANCELLED"] };
  }

  Object.assign(where, dateConditions);

  // Search filter - Updated to match schema
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
      {
        assignedTo: {
          OR: [
            { name: { contains: filters.search, mode: "insensitive" } },
            { email: { contains: filters.search, mode: "insensitive" } },
          ],
        },
      },
    ];
  }

  return where;
}

function buildOrderByClause(filters) {
  const { sortBy = "createdAt", sortOrder = "DESC" } = filters;
  const order = sortOrder.toLowerCase() === "asc" ? "asc" : "desc";

  switch (sortBy) {
    case "title":
      return { title: order };
    case "dueDate":
      return [{ dueDate: order }, { createdAt: "desc" }]; // Secondary sort by createdAt
    case "priority":
      // Define priority order: HIGH > MEDIUM > LOW
      return [
        {
          priority: order === "asc" ? "asc" : "desc",
        },
        { createdAt: "desc" },
      ];
    case "status":
      return [{ status: order }, { createdAt: "desc" }];
    case "assignedTo":
      return [
        {
          assignedTo: {
            name: order,
          },
        },
        { createdAt: "desc" },
      ];
    case "createdAt":
    default:
      return { createdAt: order };
  }
}

function buildIncludeClause(filters) {
  return {
    assignedTo: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
    createdBy: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
    comments: {
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    },
    attachments: true,
  };
}

// Applied filters
function getAppliedFilters(filters) {
  const applied = {};

  if (filters.status) applied.status = filters.status;
  if (filters.priority) applied.priority = filters.priority;
  if (filters.assignedToId) applied.assignedToId = filters.assignedToId;
  if (filters.createdById) applied.createdById = filters.createdById;
  if (filters.search) applied.search = filters.search;
  if (filters.unassigned) applied.unassigned = filters.unassigned;
  if (filters.overdue) applied.overdue = filters.overdue;
  if (filters.dueSoon) applied.dueSoon = filters.dueSoon;
  if (filters.dueDateFrom) applied.dueDateFrom = filters.dueDateFrom;
  if (filters.dueDateTo) applied.dueDateTo = filters.dueDateTo;
  if (filters.sortBy) applied.sortBy = filters.sortBy;
  if (filters.sortOrder) applied.sortOrder = filters.sortOrder;

  return applied;
}

export const getFilterOptions = async (organizationId) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        organizationId,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: { name: "asc" },
    });

    return {
      statuses: ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
      priorities: ["LOW", "MEDIUM", "HIGH"],
      users,
      sortOptions: [
        { value: "createdAt", label: "Created Date" },
        { value: "dueDate", label: "Due Date" },
        { value: "title", label: "Title" },
        { value: "priority", label: "Priority" },
        { value: "status", label: "Status" },
        { value: "assignedTo", label: "Assigned To" },
      ],
    };
  } catch (error) {
    console.error("Error fetching filter options:", error);
    return null;
  }
};

// Get task statistics
export const getTaskStatistics = async (organizationId, filters = {}) => {
  try {
    const baseWhere = { organizationId, ...buildWhereClause(filters) };

    const [
      totalTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      overdueTasks,
      unassignedTasks,
    ] = await Promise.all([
      prisma.task.count({ where: baseWhere }),
      prisma.task.count({ where: { ...baseWhere, status: "PENDING" } }),
      prisma.task.count({ where: { ...baseWhere, status: "IN_PROGRESS" } }),
      prisma.task.count({ where: { ...baseWhere, status: "COMPLETED" } }),
      prisma.task.count({
        where: {
          ...baseWhere,
          dueDate: { lt: new Date() },
          status: { notIn: ["COMPLETED", "CANCELLED"] },
        },
      }),
      prisma.task.count({ where: { ...baseWhere, assignedToId: null } }),
    ]);

    return {
      total: totalTasks,
      byStatus: {
        pending: pendingTasks,
        inProgress: inProgressTasks,
        completed: completedTasks,
      },
      overdue: overdueTasks,
      unassigned: unassignedTasks,
      completionRate:
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    };
  } catch (error) {
    console.error("Error getting task statistics:", error);
    throw error;
  }
};


// import prisma from "../prisma";


// // ------------------------
// // Task CRUD Operations
// // ------------------------

// export const getFilteredTasks = async (filters = {}) => {
//   try {
//     const safeFilters = {
//       page: 1,
//       limit: 20,
//       sortBy: "createdAt",
//       sortOrder: "DESC",
//       ...filters,
//     };

//     const where = buildWhereClause(safeFilters);
//     const orderBy = buildOrderByClause(safeFilters);
//     const include = buildIncludeClause(safeFilters);
//     const skip = (safeFilters.page - 1) * safeFilters.limit;
//     const take = safeFilters.limit;

//     const [tasks, total] = await Promise.all([
//       prisma.task.findMany({ where, include, orderBy, skip, take }),
//       prisma.task.count({ where }),
//     ]);

//     return {
//       success: true,
//       data: tasks,
//       pagination: {
//         page: safeFilters.page,
//         limit: safeFilters.limit,
//         total,
//         pages: Math.ceil(total / safeFilters.limit),
//       },
//       filters: getAppliedFilters(safeFilters),
//     };
//   } catch (error) {
//     console.error("Get tasks error:", error);
//     throw error;
//   }
// };

// export const createTask = async (data) => {
//   return await prisma.task.create({
//     data: {
//       title: data.title,
//       description: data.description || "",
//       priority: data.priority || "MEDIUM",
//       status: data.status || "PENDING",
//       organizationId: data.organizationId,
//       createdById: data.createdById,
//       assignedToId: data.assignedToId || null,
//       dueDate: data.dueDate || null,
//     },
//   });
// };

// export const updateTask = async (id, data) => {
//   return await prisma.task.update({
//     where: { id },
//     data,
//   });
// };

// export const deleteTask = async (id) => {
//   return await prisma.task.delete({ where: { id } });
// };

// export const getTaskById = async (id) => {
//   return await prisma.task.findUnique({ where: { id } });
// };

// // ------------------------
// // Comments
// // ------------------------

// export const addCommentToTask = async (taskId, commentData) => {
//   return await prisma.taskComment.create({
//     data: {
//       content: commentData.content,
//       task: { connect: { id: taskId } },
//       user: { connect: { id: commentData.userId } },
//     },
//   });
// };

// export const getComment = async (taskId) => {
//   return await prisma.taskComment.findMany({ where: { taskId } });
// };

// // ------------------------
// // Filters & Search
// // ------------------------

// function buildWhereClause(filters) {
//   const where = {};

//   if (filters.status?.length) {
//     where.status = { in: filters.status };
//   }

//   if (filters.priority?.length) {
//     where.priority = { in: filters.priority };
//   }

//   if (filters.assignedToId?.length) {
//     where.assignedToId = { in: filters.assignedToId };
//   }

//   if (filters.createdById) {
//     where.createdById = filters.createdById;
//   }

//   if (filters.unassigned) {
//     where.assignedToId = null;
//   }

//   const dateConditions = {};

//   if (filters.dueDateFrom || filters.dueDateTo) {
//     dateConditions.dueDate = {};
//     if (filters.dueDateFrom) dateConditions.dueDate.gte = new Date(filters.dueDateFrom);
//     if (filters.dueDateTo) dateConditions.dueDate.lte = new Date(filters.dueDateTo);
//   }

//   if (filters.createdFrom || filters.createdTo) {
//     dateConditions.createdAt = {};
//     if (filters.createdFrom) dateConditions.createdAt.gte = new Date(filters.createdFrom);
//     if (filters.createdTo) dateConditions.createdAt.lte = new Date(filters.createdTo);
//   }

//   if (filters.overdue) {
//     dateConditions.dueDate = { ...dateConditions.dueDate, lt: new Date() };
//     where.status = { notIn: ["COMPLETED", "CANCELLED"] };
//   }

//   if (filters.dueSoon) {
//     const nextWeek = new Date();
//     nextWeek.setDate(nextWeek.getDate() + 7);

//     dateConditions.dueDate = {
//       ...dateConditions.dueDate,
//       gte: dateConditions.dueDate?.gte || new Date(),
//       lte: dateConditions.dueDate?.lte || nextWeek,
//     };
//     where.status = { notIn: ["COMPLETED", "CANCELLED"] };
//   }

//   Object.assign(where, dateConditions);

//   if (filters.search) {
//     where.OR = [
//       { title: { contains: filters.search, mode: "insensitive" } },
//       { description: { contains: filters.search, mode: "insensitive" } },
//       {
//         assignedTo: {
//           OR: [
//             { name: { contains: filters.search, mode: "insensitive" } },
//             { email: { contains: filters.search, mode: "insensitive" } },
//           ],
//         },
//       },
//     ];
//   }

//   return where;
// }

// function buildOrderByClause(filters) {
//   const { sortBy = "createdAt", sortOrder = "DESC" } = filters;
//   const order = sortOrder.toLowerCase() === "asc" ? "asc" : "desc";

//   switch (sortBy) {
//     case "title":
//       return { title: order };
//     case "dueDate":
//       return [{ dueDate: order }, { createdAt: "desc" }];
//     case "priority":
//       return [{ priority: order }, { createdAt: "desc" }];
//     case "status":
//       return [{ status: order }, { createdAt: "desc" }];
//     case "assignedTo":
//       return [{ assignedTo: { name: order } }, { createdAt: "desc" }];
//     case "createdAt":
//     default:
//       return { createdAt: order };
//   }
// }

// function buildIncludeClause(filters) {
//   return {
//     assignedTo: {
//       select: { id: true, name: true, email: true },
//     },
//     createdBy: {
//       select: { id: true, name: true, email: true },
//     },
//     comments: {
//       include: {
//         user: {
//           select: { id: true, name: true, email: true },
//         },
//       },
//       orderBy: { createdAt: "desc" },
//     },
//     attachments: true,
//   };
// }

// function getAppliedFilters(filters) {
//   const applied = {};
//   if (filters.status) applied.status = filters.status;
//   if (filters.priority) applied.priority = filters.priority;
//   if (filters.assignedToId) applied.assignedToId = filters.assignedToId;
//   if (filters.createdById) applied.createdById = filters.createdById;
//   if (filters.search) applied.search = filters.search;
//   if (filters.unassigned) applied.unassigned = filters.unassigned;
//   if (filters.overdue) applied.overdue = filters.overdue;
//   if (filters.dueSoon) applied.dueSoon = filters.dueSoon;
//   if (filters.dueDateFrom) applied.dueDateFrom = filters.dueDateFrom;
//   if (filters.dueDateTo) applied.dueDateTo = filters.dueDateTo;
//   if (filters.sortBy) applied.sortBy = filters.sortBy;
//   if (filters.sortOrder) applied.sortOrder = filters.sortOrder;
//   return applied;
// }

// // ------------------------
// // Filter Options
// // ------------------------

// export const getFilterOptions = async (organizationId) => {
//   try {
//     const users = await prisma.user.findMany({
//       where: { organizationId },
//       select: { id: true, name: true, email: true },
//       orderBy: { name: "asc" },
//     });

//     return {
//       statuses: ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
//       priorities: ["LOW", "MEDIUM", "HIGH"],
//       users,
//       sortOptions: [
//         { value: "createdAt", label: "Created Date" },
//         { value: "dueDate", label: "Due Date" },
//         { value: "title", label: "Title" },
//         { value: "priority", label: "Priority" },
//         { value: "status", label: "Status" },
//         { value: "assignedTo", label: "Assigned To" },
//       ],
//     };
//   } catch (error) {
//     console.error("Error fetching filter options:", error);
//     return null;
//   }
// };

// // ------------------------
// // Task Statistics
// // ------------------------

// export const getTaskStatistics = async (organizationId, filters = {}) => {
//   try {
//     const baseWhere = { organizationId, ...buildWhereClause(filters) };

//     const [
//       totalTasks,
//       pendingTasks,
//       inProgressTasks,
//       completedTasks,
//       overdueTasks,
//       unassignedTasks,
//     ] = await Promise.all([
//       prisma.task.count({ where: baseWhere }),
//       prisma.task.count({ where: { ...baseWhere, status: "PENDING" } }),
//       prisma.task.count({ where: { ...baseWhere, status: "IN_PROGRESS" } }),
//       prisma.task.count({ where: { ...baseWhere, status: "COMPLETED" } }),
//       prisma.task.count({
//         where: {
//           ...baseWhere,
//           dueDate: { lt: new Date() },
//           status: { notIn: ["COMPLETED", "CANCELLED"] },
//         },
//       }),
//       prisma.task.count({ where: { ...baseWhere, assignedToId: null } }),
//     ]);

//     return {
//       total: totalTasks,
//       byStatus: {
//         pending: pendingTasks,
//         inProgress: inProgressTasks,
//         completed: completedTasks,
//       },
//       overdue: overdueTasks,
//       unassigned: unassignedTasks,
//       completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
//     };
//   } catch (error) {
//     console.error("Error getting task statistics:", error);
//     throw error;
//   }
// };
