import audio from './audio.png';
import video from './video.png';
import _3gp from './3gp.png';
import pdf from './pdf.png';
import folder from './folder.png';
import file from './file.png';
import php from './php.png';
import image from './img.png';
import mp3 from './mp3.png';
import doc from './doc.png';
import txt from './txt.png';
import js from './js.png';
import jsx from './jsx.png';
import json from './json.png';
import css from './css.png';
import csharp from './csharp.png';
import html from './html.png';
import xml from './xml.png';
import xaml from './xaml.png';
import xlsx from './xlsx.png';
import svg from './svg.png';
import csv from './csv.png';
import md from './md.png';
import zip from './zip.png';
import rar from './rar.png';
import z7 from './7z.png';
import exe from './exe.png';
import dll from './dll.png';
import rtf from './rtf.png';
import msi from './msi.png';
import ini from './ini.png';
import iso from './iso.png';
import ico from './ico.png';
import font from './font.png';
import rdp from './rdp.png';
import nugget from './nupkg.png';

export default function icon(name, isDir) {
  if (isDir) return folder;
  if (name.match(/\.wav$|\.aac$|\.weba$|\.wma$|\.flac$|\.aiff?$/i)) return audio;
  if (name.match(/\.mp4$|\.flv$|\.webv$|\.wmv$|\.mkv$|\.mov$|\.avi/i)) return video;
  if (name.match(/\.mp3$/i)) return mp3;
  if (name.match(/\.png$|\.jpe?g$|\.gif/i)) return image;
  if (name.match(/\.3gp$/i)) return _3gp;
  if (name.match(/\.pdf$/i)) return pdf;
  if (name.match(/\.php$/i)) return php;
  if (name.match(/\.js$/i)) return js;
  if (name.match(/\.jsx$/i)) return jsx;
  if (name.match(/\.json$/i)) return json;
  if (name.match(/\.m?htm?l?$/i)) return html;
  if (name.match(/\.svg$/i)) return svg;
  if (name.match(/\.csv$/i)) return csv;
  if (name.match(/\.iso$/i)) return iso;
  if (name.match(/\.ico$/i)) return ico;
  if (name.match(/\.md$/i)) return md;
  if (name.match(/\.zip$/i)) return zip;
  if (name.match(/\.rar$/i)) return rar;
  if (name.match(/\.7z$/i)) return z7;
  if (name.match(/\.exe$/i)) return exe;
  if (name.match(/\.dll$/i)) return dll;
  if (name.match(/\.rtf$/i)) return rtf;
  if (name.match(/\.msi$/i)) return msi;
  if (name.match(/\.rdp$/i)) return rdp;
  if (name.match(/\.cs$/i)) return csharp;
  if (name.match(/\.xml$/i)) return xml;
  if (name.match(/\.xaml$/i)) return xaml;
  if (name.match(/\.xlsx$/i)) return xlsx;
  if (name.match(/\.nupkg$/i)) return nugget;
  if (name.match(/\.ini$|\.config$|\.properties$/i)) return ini;
  if (name.match(/\.ttf$|\.otf$|\.woff2?$|\.eot$/i)) return font;
  if (name.match(/\.doc$|\.docx$/i)) return doc;
  if (name.match(/\.txt$|\.log$/i)) return txt;
  if (name.match(/\.s?css$|\.sass$|\.less/i)) return css;
  return file;
}
