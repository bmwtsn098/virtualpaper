/*
 * Virtualpaper is a service to manage users paper documents in virtual format.
 * Copyright (C) 2022  Tero Vierimaa
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import React from "react";
import {
  ArrayField,
  Button,
  ChipField,
  Datagrid,
  DateField,
  EditButton,
  Labeled,
  LabeledClasses,
  Show,
  SingleFieldList,
  Tab,
  TabbedShowLayout,
  TextField,
  TopToolbar,
  useRecordContext,
} from "react-admin";
import {
  Box,
  Grid,
  Typography,
  Divider,
  Card,
  CardContent,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import TimelineIcon from "@mui/icons-material/Timeline";
import CloseIcon from "@mui/icons-material/Close";
import {
  DownloadDocumentButton,
  EmbedFile,
  ThumbnailField,
} from "../Thumbnail";
import { IndexingStatusField } from "../IndexingStatus";
import { MarkdownField } from "../../Markdown";
import { ShowDocumentsEditHistory } from "./DocumentHistory";
import { LinkedDocumentList } from "./LinkedDocuments";
import { DocumentJobsHistory, DocumentTopRow } from "./Show";
import { RequestIndexingModal } from "../RequestIndexing";
import get from "lodash/get";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import MoreVertIcon from "@mui/icons-material/MoreVert";

export const DocumentShow = () => {
  const [asideMode, setAsideMode] = React.useState<AsideMode>("closed");
  const [downloadUrl, setDownloadUrl] = React.useState("");
  const isNotSmall = useMediaQuery((theme: any) => theme.breakpoints.up("sm"));

  return (
    <Show
      title="Document"
      actions={
        <DocumentShowActions
          showHistory={() => setAsideMode("history")}
          showJobs={() => setAsideMode("jobs")}
          downloadUrl={downloadUrl}
        />
      }
      aside={
        isNotSmall ? (
          <DocumentShowAside mode={asideMode} setMode={setAsideMode} />
        ) : undefined
      }
    >
      <TabbedShowLayout>
        <Tab label="general">
          <DocumentGeneralTab />
        </Tab>
        <Tab label="Content">
          <DocumentContentTab />
        </Tab>
        <Tab label="preview">
          <DocumentPreviewTab setDownloadUrl={setDownloadUrl} />
        </Tab>
      </TabbedShowLayout>
      {!isNotSmall && (
        <DocumentShowAsideModal mode={asideMode} setMode={setAsideMode} />
      )}
    </Show>
  );
};

interface ActionsProps {
  showHistory: (shown: boolean) => any;
  downloadUrl?: string;
  showJobs: (shown: boolean) => any;
}

function DocumentShowActions(props: ActionsProps) {
  const { showHistory, showJobs } = props;
  const toggleHistory = () => {
    showHistory(true);
    handleCloseMenu();
  };
  const toggleJobs = () => {
    showJobs(true);
    handleCloseMenu();
  };

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const handleClickMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const record = useRecordContext();
  if (!record) {
    return null;
  }

  return (
    <TopToolbar>
      <EditButton />
      <Button onClick={handleClickMenu} label={"More"}>
        <MoreVertIcon />
      </Button>
      <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={handleCloseMenu}>
        <MenuItem>
          <RequestIndexingModal onClose={handleCloseMenu} />
        </MenuItem>
        <MenuItem>
          <Button
            color="primary"
            onClick={toggleHistory}
            label={"Document History"}
          >
            <HistoryIcon />
          </Button>
        </MenuItem>
        <MenuItem>
          <Button
            color="primary"
            onClick={toggleJobs}
            label={"Processing history"}
          >
            <TimelineIcon />
          </Button>
        </MenuItem>
        <MenuItem>
          <DownloadDocumentButton onFinished={handleCloseMenu} />
        </MenuItem>
      </Menu>
    </TopToolbar>
  );
}

export default DocumentShow;

const DocumentGeneralTab = () => {
  const record = useRecordContext();

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={8} lg={12}>
        <DocumentTopRow />
        <IndexingStatusField source="status" label="" />
        <Box display={{ xs: "block", sm: "flex" }}>
          <Box flex={2} mr={{ xs: 0, sm: "0.5em" }}>
            <ThumbnailField source="preview_url" label="Thumbnail" />
          </Box>
          <Box flex={2} mr={{ xs: 0, sm: "0.5em" }}>
            <Labeled label="Description">
              <MarkdownField source="description" />
            </Labeled>
          </Box>
          {record && record.tags ? (
            <Box flex={2} mr={{ xs: 0, sm: "0.5em" }}>
              <ArrayField source="tags">
                <SingleFieldList>
                  <ChipField source="key" />
                </SingleFieldList>
              </ArrayField>
            </Box>
          ) : null}
        </Box>
        <Box display={{ xs: "block", sm: "flex" }}>
          <Box flex={2} mr={{ xs: 0, sm: "0.5em" }}>
            <LinkedDocumentList />
          </Box>
        </Box>

        <Box display={{ xs: "block", sm: "flex" }}>
          <Box flex={2} mr={{ xs: 0, sm: "0.5em" }}>
            <MetadataList />
          </Box>
        </Box>
        <Box display={{ xs: "block", sm: "flex" }}>
          <Box flex={2} mr={{ xs: 0, sm: "0.5em" }}>
            <Labeled label={"File size"}>
              <TextField source={"pretty_size"} />
            </Labeled>
          </Box>
        </Box>
        <Box display={{ xs: "block", sm: "flex" }}>
          <Box flex={2} mr={{ xs: 0, sm: "0.5em" }}>
            <Labeled label="Uploaded">
              <DateField source="created_at" showTime={false} />
            </Labeled>
          </Box>
          <Box flex={2} mr={{ xs: 0, sm: "0.5em" }}>
            <Labeled label={"Last updated"}>
              <DateField source="updated_at" showTime />
            </Labeled>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

const DocumentContentTab = () => {
  const [enableFormatting, setState] = React.useState(true);

  const toggleFormatting = () => {
    if (enableFormatting) {
      setState(false);
    } else {
      setState(true);
    }
  };

  return (
    <Grid container maxWidth={800}>
      <Grid item sx={{ pb: 3, pt: 2 }}>
        <Box
          style={{
            display: "flex",
            flexFlow: " row",
            justifyContent: "flex-end",
          }}
        >
          <Button
            color="primary"
            size="small"
            variant="contained"
            onClick={toggleFormatting}
            sx={{ mr: 4 }}
          >
            <div>
              {enableFormatting ? "Enable formatting" : "Disable formatting"}
            </div>
          </Button>
          <div style={{ maxWidth: 400 }}>
            <Typography variant="body2">
              This page show automatically extracted content for the document.
              The quality and accuracy may vary depending on document type and
              quality.
            </Typography>
          </div>
        </Box>
      </Grid>
      <Grid item>
        <Typography variant="h5">Document content</Typography>
        <Divider sx={{ pt: 1 }} />
        {enableFormatting ? (
          <TextField source="content" label="Raw parsed text content" />
        ) : (
          <MarkdownField source="content" label="Raw parsed text content" />
        )}
      </Grid>
    </Grid>
  );
};

const DocumentPreviewTab = (props: {
  setDownloadUrl: (url: string) => void;
}) => {
  const record = useRecordContext();
  return (
    <EmbedFile
      source="download_url"
      filename={get(record, "filename")}
      {...props}
    />
  );
};

const MetadataList = () => {
  const record = useRecordContext();

  if (!record) {
    return null;
  }

  if (get(record, "metadata")?.length === 0) {
    return null;
  }

  return (
    <>
      <Typography className={LabeledClasses.label}>Metadata</Typography>
      <ArrayField source="metadata">
        <Datagrid bulkActionButtons={false}>
          <TextField source="key" />
          <TextField source="value" />
        </Datagrid>
      </ArrayField>
    </>
  );
};

type AsideMode = "closed" | "history" | "jobs";

interface AsideProps {
  mode: AsideMode;
  setMode: (mode: AsideMode) => void;
}

const DocumentShowAside = (props: AsideProps) => {
  const { mode, setMode } = props;

  if (mode == "closed") {
    return null;
  }

  return (
    <Box ml={1} sx={{ maxWidth: "30%" }}>
      <Card>
        <CardContent>
          <Button
            label={"Close"}
            variant="outlined"
            onClick={() => setMode("closed")}
            sx={{ mb: 2 }}
          />
          {mode == "history" && <ShowDocumentsEditHistory />}
          {mode == "jobs" && <DocumentJobsHistory />}
        </CardContent>
      </Card>
    </Box>
  );
};

const DocumentShowAsideModal = (props: AsideProps) => {
  const { mode, setMode } = props;

  const title = mode === "history" ? "Document history" : "Processing history";

  return (
    <Dialog open={mode !== "closed"} scroll="paper">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {mode == "history" && <ShowDocumentsEditHistory />}
        {mode == "jobs" && <DocumentJobsHistory />}
      </DialogContent>
      <DialogActions>
        <Button label={"Close"} onClick={() => setMode("closed")}>
          <CloseIcon />
        </Button>
      </DialogActions>
    </Dialog>
  );
};
