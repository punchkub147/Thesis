db.collection('needWork').add({
  employer_id: employer.employer_id,
  work_id: work.work_id,
  employee_id: user.uid,
  name: `${user.data.fname} ${user.data.lname}`,
  phone: user.data.phone,

  pack: 1, //user ต้องการจำนวนกี่ชิ้น 
  deviceToken: user.data.deviceToken,
})