import { FileSetInterface } from '../../src/app/modules/elasticsearch-cold-log-ingest/interfaces/file-set.interface';

export const MockFileSetInterfaceErrorLogs: FileSetInterface = {
  name: "Error logs",
  tooltip: "Normally found in /var/log/httpd folder.",
  value: "error"
};

export const MockFileSetInterfaceAccessLogs: FileSetInterface = {
  name: "Access logs",
  tooltip: "Normally found in /var/log/httpd folder.",
  value: "access"
};

export const MockFileSetInterfaceAuditdLogs: FileSetInterface = {
  name: "Auditd logs",
  tooltip: "",
  value: "log"
};
