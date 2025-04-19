import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { v2 as cloudinary } from "cloudinary";
import { Softwares } from "../model/softwaresSchema.js";

export const addSoftware = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Softaware Icon/svg Required!", 400));
  }
  const { svg } = req.files;
  const { name } = req.body;

  const cloudinarySvgResponse = await cloudinary.uploader.upload(
    svg.tempFilePath,
    { folder: "SOFTWARES" }
  );
  if (!cloudinarySvgResponse || cloudinarySvgResponse.error) {
    console.log(
      "Cloudinary Error:",
      cloudinarySvgResponse.error || "Unknown Cloudinary Error"
    );
  }

  const softwares = await Softwares.create({
    name,
    svg: {
      public_id: cloudinarySvgResponse.public_id,
      url: cloudinarySvgResponse.secure_url,
    },
  });

  res.status(200).json({
    success: true,
    message: "Software added Successfully!!",
    softwares,
  });
});
export const deleteSoftware = catchAsyncErrors(async (req, res, next) => {
    const {id} = req.params;
    const software = await Softwares.findById(id);
    if(!software){
        return next(new ErrorHandler("Softwares Not Found!!", 404));
    }

    const softwareSvgId = software.svg.public_id;
    await cloudinary.uploader.destroy(softwareSvgId);
    await software.deleteOne();
    res.status(200).json({
        success:true,
        message:"Software deleted successfully"
    })
});
export const getAllSoftwares = catchAsyncErrors(async (req, res, next) => {
    const getAllSoftwares = await Softwares.find();
    res.status(200).json({
        success:true,
        getAllSoftwares
    })
});
