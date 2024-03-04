module.exports = {
  approvedSlotEmail: {
    subject: "Slot Approved : {{matchName}}", // Subject line
    text: "", // Plain text body
    html: `<p>Hi {{firstName}},</p><p><br></p><p>Your slot for the upcoming tournament on {{date}} is confirmed. Let's meet at playground.</p><p><br></p><p><img src="https://images.rawpixel.com/image_png_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTA4L3Jhd3BpeGVsX29mZmljZV83X3dhdGVyY29sb3JfaWxsdXN0cmF0aW9uX29mX3NvY2Nlcl9pc29sYXRlX2lsbF8zNDY3YzViMC0wZWEyLTQwNWYtYmM1Yi0xNWFjYmExNjg0NTMucG5n.png" alt="" width="300"></p><p><br></p><p>Thanks,</p><p>WFG Team</p>`,
  },
};
