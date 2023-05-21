import * as React from "react";
import { Box, Typography } from "@mui/material";

function TestPage() {
  console.log(`testing page start`);

  return (
    <Box className="w-screen h-screen flex flex-col bg-stone-50">
      <Box className="w-full flex-1 bg-red-50 flex flex-row justify-center">
        <div className="flex-1 bg-stone-100">aaaa</div>
        <div className="flex-1 bg-stone-400">bbbb</div>
      </Box>
      <Box className="w-full h-[180px] bg-yellow-200">asdfsadf</Box>
    </Box>
  );
}

export default TestPage;
