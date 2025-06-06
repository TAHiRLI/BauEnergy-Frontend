import Cookies from "universal-cookie";
import Docxtemplater from "docxtemplater";
import { HttpClient } from "../HttpClients";
import PizZip from "pizzip";
import PizZipUtils from "pizzip/utils/index.js";
import { saveAs } from "file-saver";
const cookies = new Cookies();

class FileService extends HttpClient {
  docutmentUrl = process.env.REACT_APP_DOCUMENT_URL;
  constructor() {
    super(process.env.REACT_APP_API_URL);
  }

  //==========================================
  // Practice
  //==========================================
  async getCertificate(fulname, birthDate, scorePercent) {
    let fileName = "BauEnergyZertifikate2.docx";
    var options = {
      data: {
        name: fulname,
        lastName: "", 
        birthDate: formatDate(birthDate),
        currentDate: formatDate(new Date()),
        scorePercent
      },
      outputName: "Certificate Of graduation",
    };
    loadAndGenerateFile(`${this.docutmentUrl}/UserCertificates/${fileName}`, options);
  }
}
export const formatDate = (date) => {
  if(!date) return "";
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
};

export const fileService = new FileService();

function loadAndGenerateFile(url, options) {
  PizZipUtils.getBinaryContent(url, function (error, content) {
    if (error) {
      throw error;
    }
    var zip = new PizZip(content);
    var doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });
    doc.setData(options?.data);
    try {
      doc.render();
    } catch (error) {
      function replaceErrors(key, value) {
        if (value instanceof Error) {
          return Object.getOwnPropertyNames(value).reduce(function (error, key) {
            error[key] = value[key];
            return error;
          }, {});
        }
        return value;
      }
      console.log(JSON.stringify({ error: error }, replaceErrors));

      if (error.properties && error.properties.errors instanceof Array) {
        const errorMessages = error.properties.errors
          .map(function (error) {
            return error.properties.explanation;
          })
          .join("\n");
        console.log("errorMessages", errorMessages);
      }
      throw error;
    }

    var out = doc.getZip().generate({
      type: "blob",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    saveAs(out, options?.outputName);
  });
}

