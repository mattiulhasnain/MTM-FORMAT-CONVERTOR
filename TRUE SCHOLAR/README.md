# Advanced Offline File Converter

## Overview
The Advanced Offline File Converter is a web-based application that allows users to convert files between various formats entirely offline. It supports a wide range of file types, including images, documents, audio, and video. The application is built using HTML, CSS, and JavaScript, with all libraries and assets stored locally to ensure complete offline functionality.

## Features
- **Supported Formats**:
  - **Images**: JPG, PNG, BMP, GIF, TIFF, WEBP
  - **Documents**: TXT, DOCX, CSV (with placeholder DOCX/CSV-to-PDF conversion)
  - **Audio**: MP3, WAV, OGG, FLAC (simulated conversion)
  - **Video**: MP4, AVI, MKV, MOV (simulated conversion)
- **Advanced File Type Detection**: Automatically recognizes file types and provides appropriate conversion options.
- **File Metadata Preview**: Displays basic file metadata (name, size, type) in the preview area.
- **Conversion Options**: A dropdown menu for selecting the target format for each file type.
- **Conversion Queue Management**: A detailed conversion queue with progress updates per file.
- **Enhanced Logging & Error Reporting**: Detailed logs for troubleshooting and monitoring conversion processes.
- **Settings Modal Enhancements**: More settings for adjusting conversion options and preferences.
- **Improved Batch Processing**: Support for parallel processing with simulated Web Worker integration.
- **User Preferences & Localization**: Store settings (theme, language, conversion options) in localStorage and support multi-language toggling.
- **Robust Error Handling**: Detailed logging and error messages for troubleshooting.

## Usage
1. **Drag & Drop Files**: Drag and drop files into the drop zone or click to select files.
2. **Select Target Format**: Choose the desired output format from the dropdown menu.
3. **Start Conversion**: The conversion process will start automatically, and you can monitor the progress in the progress bar.
4. **Download Converted Files**: Once the conversion is complete, download the converted files using the provided link.

## Installation
1. Clone the repository or download the source code.
2. Open the `index.html` file in your web browser.
3. The application will run entirely offline, with all libraries and assets stored locally.

## Dependencies
- **jsPDF**: For document-to-PDF conversion (included locally).
- **FFmpeg.wasm**: For audio and video conversion (simulated with placeholders).

## Contributing
Contributions are welcome! Please fork the repository and submit a pull request with your changes.

## License
This project is licensed under the MIT License. See the `LICENSE` file for more details.

## Acknowledgments
- Developed by M&A.
- Special thanks to the open-source community for providing the libraries and tools used in this project.

## Contact
For any questions or feedback, please contact bc240412496mmu@vu.edu.pk.
