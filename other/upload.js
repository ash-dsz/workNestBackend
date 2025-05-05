import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";

// Create folders if not exist
const ensureDir = (dir) => {
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}
};

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		let folder = "uploads/";
		if (file.fieldname === "profilePic") folder += "profiles/";
		else if (file.fieldname === "documents") folder += "docs/";

		ensureDir(folder);
		cb(null, folder);
	},
	filename: function (req, file, cb) {
		const ext = path.extname(file.originalname);
		const uniqueName = uuidv4() + ext;
		cb(null, uniqueName);
	},
});

const upload = multer({ storage });

export default upload;
