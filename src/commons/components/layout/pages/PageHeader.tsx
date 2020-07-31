import React from "react";
import { Typography, Box } from "@material-ui/core";

type PageHeaderProps = {
  title: string;
};

const PageHeader: React.FC<PageHeaderProps> = ({ title }) => {
  return (
      <Box display="inline-block" pt={3}>
        <Typography variant="h6">{title}</Typography>
      </Box>
  );
};

export default PageHeader;
