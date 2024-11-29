import _ from 'lodash';
const SQL_TYPES = `TABLE|TABLESPACE|PROCEDURE|FUNCTION|TRIGGER|KEY|VIEW|MATERIALIZED VIEW|LIBRARY|DATABASE LINK|DBLINK|INDEX|CONSTRAINT|TRIGGER|USER|SCHEMA|DATABASE|PLUGGABLE DATABASE|BUCKET|CLUSTER|COMMENT|SYNONYM|TYPE|JAVA|SESSION|ROLE|PACKAGE|PACKAGE BODY|OPERATOR|SEQUENCE|RESTORE POINT|PFILE|CLASS|CURSOR|OBJECT|RULE|USER|DATASET|DATASTORE|COLUMN|FIELD|OPERATOR`;
const SQL_REGEXPS = [
  "(.*)(\\b)+(OR|AND)(\\s)+(true|false)(\\s)*(.*)",
  "(.*)(\\b)+(OR|AND)(\\s)+(\\w)(\\s)*(\\=)(\\s)*(\\w)(\\s)*(.*)",
  "(.*)(\\b)+(OR|AND)(\\s)+(equals|not equals)(\\s)+(true|false)(\\s)*(.*)",
  "(.*)(\\b)+(OR|AND)(\\s)+([0-9A-Za-z_'][0-9A-Za-z\\d_']*)(\\s)*(\\=)(\\s)*([0-9A-Za-z_'][0-9A-Za-z\\d_']*)(\\s)*(.*)",
  "(.*)(\\b)+(OR|AND)(\\s)+([0-9A-Za-z_'][0-9A-Za-z\\d_']*)(\\s)*(\\!\\=)(\\s)*([0-9A-Za-z_'][0-9A-Za-z\\d_']*)(\\s)*(.*)",
  "(.*)(\\b)+(OR|AND)(\\s)+([0-9A-Za-z_'][0-9A-Za-z\\d_']*)(\\s)*(\\<\\>)(\\s)*([0-9A-Za-z_'][0-9A-Za-z\\d_']*)(\\s)*(.*)",
  "(.*)(\\b)+SELECT(\\b)+\\s.*(\\b)(.*)",
  "(.*)(\\b)+INSERT(\\b)+\\s.*(\\b)+INTO(\\b)+\\s.*(.*)",
  "(.*)(\\b)+UPDATE(\\b)+\\s.*(.*)",
  "(.*)(\\b)+DELETE(\\b)+\\s.*(\\b)+FROM(\\b)+\\s.*(.*)",
  "(.*)(\\b)+UPSERT(\\b)+\\s.*(.*)",
  "(.*)(\\b)+SAVEPOINT(\\b)+\\s.*(.*)",
  "(.*)(\\b)+CALL(\\b)+\\s.*(.*)",
  "(.*)(\\b)+ROLLBACK(\\b)+\\s.*(.*)",
  "(.*)(\\b)+KILL(\\b)+\\s.*(.*)",
  "(.*)(\\b)+DROP(\\b)+\\s.*(.*)",
  "(.*)(\\b)+CREATE(\\b)+(\\s)*(" + SQL_TYPES + ")(\\b)+\\s.*(.*)",
  "(.*)(\\b)+ALTER(\\b)+(\\s)*(" + SQL_TYPES + ")(\\b)+\\s.*(.*)",
  "(.*)(\\b)+TRUNCATE(\\b)+(\\s)*(" + SQL_TYPES + ")(\\b)+\\s.*(.*)",
  "(.*)(\\b)+LOCK(\\b)+(\\s)*(" + SQL_TYPES + ")(\\b)+\\s.*(.*)",
  "(.*)(\\b)+UNLOCK(\\b)+(\\s)*(" + SQL_TYPES + ")(\\b)+\\s.*(.*)",
  "(.*)(\\b)+RELEASE(\\b)+(\\s)*(" + SQL_TYPES + ")(\\b)+\\s.*(.*)",
  "(.*)(\\b)+DESC(\\b)+(\\w)*\\s.*(.*)",
  "(.*)(\\b)+DESCRIBE(\\b)+(\\w)*\\s.*(.*)",
  "(.*)(/\\*|\\*/|;){1,}(.*)",
  "(.*)(-){2,}(.*)",
];

export const validateSQL = (input: string): Array<any> => {
  let errors: Array<any> = [];
  const sqlErrors = [];
  SQL_REGEXPS.forEach((r) => {
    sqlErrors.push(((input).toString().toUpperCase()?.match(r)) ? r : null);
  });
  errors.push(_.compact(sqlErrors).length > 0 ? { detail: input, description: `Value might be a SQL Injection` } : null);

  errors = _.compact(errors);
  return errors;
}