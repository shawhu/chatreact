import React, { ChangeEvent, useState } from "react";
import ExifReader from "exifreader";

const TestWebPMetadata = () => {
  const [metadata, setMetadata] = useState<object | null>(null);

  const handleFileChange = async (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    const file = event.target.files ? event.target.files[0] : null;

    if (!file) {
      return;
    }

    const tags = await ExifReader.load(file, { includeUnknown: true });
    //const imageDate = tags["DateTimeOriginal"].description;
    //const unprocessedTagValue = tags["DateTimeOriginal"].value;
    console.log(tags);
    setMetadata(tags);
  };

  return (
    <>
      <h1>Pick an image file</h1>
      <input type="file" onChange={handleFileChange} />
      {!!metadata && (
        <div>
          <h2>Metadata</h2>
          <pre>{JSON.stringify(metadata, null, 2)}</pre>
        </div>
      )}
    </>
  );
};

export default TestWebPMetadata;
