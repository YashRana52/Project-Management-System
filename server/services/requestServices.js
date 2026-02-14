import { SupervisorRequest } from "../models/superwiserRequest.js";
import ErrorHandler from "../middlewares/error.js";
export const createRequest = async (requestData) => {
  // 1. Pending request check
  const pendingRequest = await SupervisorRequest.findOne({
    student: requestData.student,
    supervisor: requestData.supervisor,
    status: "pending",
  });

  if (pendingRequest) {
    throw new ErrorHandler(
      "You already have a pending request with this supervisor",
      400,
    );
  }

  // 2. Rejected request mile to delete karo
  await SupervisorRequest.deleteMany({
    student: requestData.student,
    supervisor: requestData.supervisor,
    status: "rejected",
  });

  // 3. New request create karo
  return await SupervisorRequest.create({
    ...requestData,
    status: "pending",
  });
};

export const getAllRequest = async (filters) => {
  const requests = await SupervisorRequest.find(filters)
    .populate("student", "name email")
    .populate("supervisor", "name email")
    .sort({ createdAt: -1 });

  const total = await SupervisorRequest.countDocuments(filters);
  return { requests, total };
};

export const acceptRequest = async (requestId, supervisorId) => {
  const request = await SupervisorRequest.findById(requestId)
    .populate("student")
    .populate("supervisor");

  if (!request) throw new Error("Request not found");

  // Authorization
  if (request.supervisor._id.toString() !== supervisorId.toString()) {
    throw new Error("Not authorised to accept the request");
  }

  // Status check
  if (request.status !== "pending") {
    throw new Error("Request already processed");
  }

  // Capacity check
  if (!request.supervisor.hasCapacity()) {
    throw new Error("Supervisor has reached max student limit");
  }

  //  Update request status
  request.status = "approved";
  await request.save();

  //  Assign supervisor to student
  request.student.supervisor = request.supervisor._id;
  await request.student.save();

  //  Add student to supervisor
  request.supervisor.assignedStudents.push(request.student._id);
  await request.supervisor.save();

  //  Remove other pending requests of this student
  await SupervisorRequest.updateMany(
    {
      student: request.student._id,
      status: "pending",
      _id: { $ne: request._id },
    },
    { status: "rejected" },
  );

  return request;
};

export const rejectRequest = async (requestId, supervisorId) => {
  const request = await SupervisorRequest.findById(requestId)
    .populate("student")
    .populate("supervisor");

  if (!request) throw new Error("Request not found");

  // Authorization
  if (request.supervisor._id.toString() !== supervisorId.toString()) {
    throw new Error("Not authorised to reject the request");
  }

  // Status check
  if (request.status !== "pending") {
    throw new Error("Request already processed");
  }

  // Update status
  request.status = "rejected";
  await request.save();

  return request;
};
