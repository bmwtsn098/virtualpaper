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

import * as React from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  useGetMany,
  Loading,
  Button,
  CreateBase,
  SimpleForm,
  ArrayInput,
  ReferenceInput,
  SimpleFormIterator,
  FormDataConsumer,
  SelectInput,
  TextInput,
  TextField,
  useStore,
  useNotify,
  useRedirect,
  TopToolbar,
  CreateButton,
} from "react-admin";
import {
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";
import { ExpandMore, Help, Clear } from "@mui/icons-material";
import { DocumentCard } from "./List";
import { MetadataValueInput } from "./Edit";

interface Metadata {
  KeyId: number;
  Key: string;
  Valueid: number;
  Value: string;
}
interface body {
  documents: string[];
  addMetadata: Metadata[];
  removeMetadata: Metadata[];
}

const BulkEditDocuments = () => {
  const [documentIds, setStore] = useStore("bulk-edit-document-ids", []);
  // @ts-ignore
  const idList = documentIds;
  const ids = documentIds;
  console.log("ids to edit: ", idList);
  const { data, isLoading, error, refetch } = useGetMany("documents", {
    ids: idList,
  });
  const notify = useNotify();
  const redirect = useRedirect();

  const onSuccess = (data: any) => {
    notify(`Documents modified`);
    redirect("list", "documents");
  };

  const emptyRecord = {
    documents: ids,
    add_metadata: { metadata: [] },
    remove_metadata: { metadata: [] },
  };
  
  const cancel = () => {
    redirect("list", "documents");
  }

  if (isLoading) {
    return <Loading />;
  }

  return (
    <CreateBase
      record={emptyRecord}
      redirect="false"
      mutationOptions={{ onSuccess }}
    >
      <SimpleForm>
      <Toolbar cancel={cancel}/>
        <Box width="100%">
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h5" sx={{ width: "33%" }}>
                Documents
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {idList ? "Editing " + idList.length + " documents" : null}
              </Typography>
            </AccordionSummary>
            <AccordionDetails style={{ flexDirection: "column" }}>
              <Typography variant="body1">
                {data ? data.length : "0"} Documents to edit
              </Typography>
              {data
                ? data.map((document) => <DocumentCard record={document} />)
                : null}
            </AccordionDetails>
          </Accordion>
        </Box>
        <Box width="100%">
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h5" sx={{ width: "33%" }}>
                Add metadata
              </Typography>
            </AccordionSummary>
            <AccordionDetails style={{ flexDirection: "column" }}>
              <ArrayInput source="add_metadata.metadata" label={"Add metadata"}>
                <SimpleFormIterator
                  defaultValue={[
                    { key_id: 0, key: "", value_id: 0, value: "" },
                  ]}
                  disableReordering={true}
                >
                  <ReferenceInput
                    label="Key"
                    source="key_id"
                    reference="metadata/keys"
                    fullWidth
                    className="MuiBox"
                  >
                    <SelectInput
                      optionText="key"
                      fullWidth
                      data-testid="metadata-key"
                    />
                  </ReferenceInput>

                  <FormDataConsumer>
                    {({ formData, scopedFormData, getSource }) =>
                      scopedFormData && scopedFormData.key_id ? (
                        <MetadataValueInput
                          source={getSource ? getSource("value_id") : ""}
                          record={scopedFormData}
                          label={"Value"}
                          fullWidth
                        />
                      ) : null
                    }
                  </FormDataConsumer>
                </SimpleFormIterator>
              </ArrayInput>
            </AccordionDetails>
          </Accordion>
        </Box>
        <Box width="100%">
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h5">Remove metadata</Typography>
            </AccordionSummary>
            <AccordionDetails style={{ flexDirection: "column" }}>
              <ArrayInput
                source="remove_metadata.metadata"
                label={"Add metadata"}
              >
                <SimpleFormIterator
                  defaultValue={[
                    { key_id: 0, key: "", value_id: 0, value: "" },
                  ]}
                  disableReordering={true}
                >
                  <ReferenceInput
                    label="Key"
                    source="key_id"
                    reference="metadata/keys"
                    fullWidth
                    className="MuiBox"
                  >
                    <SelectInput
                      optionText="key"
                      fullWidth
                      data-testid="metadata-key"
                    />
                  </ReferenceInput>

                  <FormDataConsumer>
                    {({ formData, scopedFormData, getSource }) =>
                      scopedFormData && scopedFormData.key_id ? (
                        <MetadataValueInput
                          source={getSource ? getSource("value_id") : ""}
                          record={scopedFormData}
                          label={"Value"}
                          fullWidth
                        />
                      ) : null
                    }
                  </FormDataConsumer>
                </SimpleFormIterator>
              </ArrayInput>
            </AccordionDetails>
          </Accordion>
        </Box>
      </SimpleForm>
    </CreateBase>
  );
};


const Toolbar = (props: any) => {
  const {cancel } = props;
  
  return (
  <TopToolbar>
  <HelpButton/>
  <Button label="Cancel" startIcon={<Clear/>} onClick={cancel}/>
    
  </TopToolbar>
    
  )
  
}

const HelpButton = () => {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Button
        label="Help"
        size="small"
        alignIcon="left"
        onClick={handleClickOpen}
      >
        <Help />
      </Button>
      <HelpDialog open={open} onClose={handleClose} />
    </div>
  );
};

const HelpDialog = (props: any) => {
  const [scroll, setScroll] = React.useState("paper");

  const { onClose, open } = props;
  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog
      onClose={handleClose}
      aria-labelledby="simple-dialog-title"
      open={open}
    >
      <DialogTitle id="simple-dialog-title">
        Help: Editing multiple documents
      </DialogTitle>
      <DialogContent dividers={scroll === "paper"}>
        <DialogContentText>
          <p>
            With this form it is possible to edit multiple document
            simultaneously. This is particularly useful when there's multiple
            documents, maybe even defined with a filter, that need similar
            editing, such as removing or adding metadata.
          </p>

          <Typography variant="h6" color="textPrimary">
            Usage
          </Typography>
          <p>
            On top there's a list of documents that are being modified. Be sure
            to verify that the documents are indeed the ones that should be
            modified.
          </p>

          <ul>
            <li>
              Add metadata: adds one or more metadata key-values to documents
            </li>
            <li>
              Remove metadata: removes one or more metadata key-values from
              documents, if they have one.{" "}
            </li>
          </ul>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>
          <Typography>Close</Typography>
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BulkEditDocuments;