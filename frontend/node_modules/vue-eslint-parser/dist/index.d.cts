/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * See LICENSE file in root directory for full license.
 */
import { ScopeManager } from "eslint-scope";
import { Rule, SourceCode } from "eslint";
import { VisitorKeys as VisitorKeys$1 } from "eslint-visitor-keys";

//#region \0rolldown/runtime.js
//#endregion
//#region src/ast/errors.d.ts
/**
 * HTML parse errors.
 */
declare class ParseError extends SyntaxError {
  code?: ErrorCode;
  index: number;
  lineNumber: number;
  column: number;
  /**
   * Create new parser error object.
   * @param code The error code. See also: https://html.spec.whatwg.org/multipage/parsing.html#parse-errors
   * @param offset The offset number of this error.
   * @param line The line number of this error.
   * @param column The column number of this error.
   */
  static fromCode(code: ErrorCode, offset: number, line: number, column: number): ParseError;
  /**
   * Normalize the error object.
   * @param x The error object to normalize.
   */
  static normalize(x: any): ParseError | null;
  /**
   * Initialize this ParseError instance.
   * @param message The error message.
   * @param code The error code. See also: https://html.spec.whatwg.org/multipage/parsing.html#parse-errors
   * @param offset The offset number of this error.
   * @param line The line number of this error.
   * @param column The column number of this error.
   */
  constructor(message: string, code: ErrorCode | undefined, offset: number, line: number, column: number);
  /**
   * Type guard for ParseError.
   * @param x The value to check.
   * @returns `true` if the value has `message`, `pos`, `loc` properties.
   */
  static isParseError(x: any): x is ParseError;
}
/**
 * The error codes of HTML syntax errors.
 * https://html.spec.whatwg.org/multipage/parsing.html#parse-errors
 */
type ErrorCode = "abrupt-closing-of-empty-comment" | "absence-of-digits-in-numeric-character-reference" | "cdata-in-html-content" | "character-reference-outside-unicode-range" | "control-character-in-input-stream" | "control-character-reference" | "eof-before-tag-name" | "eof-in-cdata" | "eof-in-comment" | "eof-in-tag" | "incorrectly-closed-comment" | "incorrectly-opened-comment" | "invalid-first-character-of-tag-name" | "missing-attribute-value" | "missing-end-tag-name" | "missing-semicolon-after-character-reference" | "missing-whitespace-between-attributes" | "nested-comment" | "noncharacter-character-reference" | "noncharacter-in-input-stream" | "null-character-reference" | "surrogate-character-reference" | "surrogate-in-input-stream" | "unexpected-character-in-attribute-name" | "unexpected-character-in-unquoted-attribute-value" | "unexpected-equals-sign-before-attribute-name" | "unexpected-null-character" | "unexpected-question-mark-instead-of-tag-name" | "unexpected-solidus-in-tag" | "unknown-named-character-reference" | "end-tag-with-attributes" | "duplicate-attribute" | "end-tag-with-trailing-solidus" | "non-void-html-element-start-tag-with-trailing-solidus" | "x-invalid-end-tag" | "x-invalid-namespace" | "x-missing-interpolation-end";
//#endregion
//#region src/ast/locations.d.ts
/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * @copyright 2017 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
/**
 * Location information in lines and columns.
 */
interface Location {
  /**
   * The line number. This is 1-based.
   */
  line: number;
  /**
   * The column number. This is 0-based.
   */
  column: number;
}
/**
 * Range information in lines and columns.
 */
interface LocationRange {
  /**
   * The start location.
   */
  start: Location;
  /**
   * The end location.
   */
  end: Location;
}
/**
 * Location information in offsets.
 * This is 0-based.
 */
type Offset = number;
/**
 * Range information in offsets.
 * The 1st element is the start offset.
 * The 2nd element is the end offset.
 *
 * This is 0-based.
 */
type OffsetRange = [Offset, Offset];
/**
 * Objects which have their location.
 */
interface HasLocation {
  range: OffsetRange;
  loc: LocationRange;
  start?: number;
  end?: number;
}
//#endregion
//#region src/ast/tokens.d.ts
/**
 * Tokens.
 */
interface Token$1 extends HasLocation {
  /**
   * Token types.
   */
  type: string;
  /**
   * Processed values.
   */
  value: string;
}
//#endregion
//#region node_modules/@typescript-eslint/types/dist/generated/ast-spec.d.ts
declare type Accessibility = 'private' | 'protected' | 'public';
declare type AccessorProperty = AccessorPropertyComputedName | AccessorPropertyNonComputedName;
declare interface AccessorPropertyComputedName extends PropertyDefinitionComputedNameBase {
  type: AST_NODE_TYPES.AccessorProperty;
}
declare interface AccessorPropertyNonComputedName extends PropertyDefinitionNonComputedNameBase {
  type: AST_NODE_TYPES.AccessorProperty;
}
declare interface ArrayExpression extends BaseNode {
  type: AST_NODE_TYPES.ArrayExpression;
  /**
   * an element will be `null` in the case of a sparse array: `[1, ,3]`
   */
  elements: (Expression | SpreadElement | null)[];
}
declare interface ArrayPattern extends BaseNode {
  type: AST_NODE_TYPES.ArrayPattern;
  decorators: Decorator[];
  elements: (DestructuringPattern | null)[];
  optional: boolean;
  typeAnnotation: TSTypeAnnotation | undefined;
}
declare interface ArrowFunctionExpression extends BaseNode {
  type: AST_NODE_TYPES.ArrowFunctionExpression;
  async: boolean;
  body: BlockStatement | Expression;
  expression: boolean;
  generator: false;
  id: null;
  params: Parameter[];
  returnType: TSTypeAnnotation | undefined;
  typeParameters: TSTypeParameterDeclaration | undefined;
}
declare interface AssignmentExpression extends BaseNode {
  type: AST_NODE_TYPES.AssignmentExpression;
  left: Expression;
  operator: ValueOf<AssignmentOperatorToText>;
  right: Expression;
}
declare interface AssignmentOperatorToText {
  [SyntaxKind.AmpersandAmpersandEqualsToken]: '&&=';
  [SyntaxKind.AmpersandEqualsToken]: '&=';
  [SyntaxKind.AsteriskAsteriskEqualsToken]: '**=';
  [SyntaxKind.AsteriskEqualsToken]: '*=';
  [SyntaxKind.BarBarEqualsToken]: '||=';
  [SyntaxKind.BarEqualsToken]: '|=';
  [SyntaxKind.CaretEqualsToken]: '^=';
  [SyntaxKind.EqualsToken]: '=';
  [SyntaxKind.GreaterThanGreaterThanEqualsToken]: '>>=';
  [SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken]: '>>>=';
  [SyntaxKind.LessThanLessThanEqualsToken]: '<<=';
  [SyntaxKind.MinusEqualsToken]: '-=';
  [SyntaxKind.PercentEqualsToken]: '%=';
  [SyntaxKind.PlusEqualsToken]: '+=';
  [SyntaxKind.QuestionQuestionEqualsToken]: '??=';
  [SyntaxKind.SlashEqualsToken]: '/=';
}
declare interface AssignmentPattern extends BaseNode {
  type: AST_NODE_TYPES.AssignmentPattern;
  decorators: Decorator[];
  left: BindingName;
  optional: boolean;
  right: Expression;
  typeAnnotation: TSTypeAnnotation | undefined;
}
declare enum AST_NODE_TYPES {
  AccessorProperty = "AccessorProperty",
  ArrayExpression = "ArrayExpression",
  ArrayPattern = "ArrayPattern",
  ArrowFunctionExpression = "ArrowFunctionExpression",
  AssignmentExpression = "AssignmentExpression",
  AssignmentPattern = "AssignmentPattern",
  AwaitExpression = "AwaitExpression",
  BinaryExpression = "BinaryExpression",
  BlockStatement = "BlockStatement",
  BreakStatement = "BreakStatement",
  CallExpression = "CallExpression",
  CatchClause = "CatchClause",
  ChainExpression = "ChainExpression",
  ClassBody = "ClassBody",
  ClassDeclaration = "ClassDeclaration",
  ClassExpression = "ClassExpression",
  ConditionalExpression = "ConditionalExpression",
  ContinueStatement = "ContinueStatement",
  DebuggerStatement = "DebuggerStatement",
  Decorator = "Decorator",
  DoWhileStatement = "DoWhileStatement",
  EmptyStatement = "EmptyStatement",
  ExportAllDeclaration = "ExportAllDeclaration",
  ExportDefaultDeclaration = "ExportDefaultDeclaration",
  ExportNamedDeclaration = "ExportNamedDeclaration",
  ExportSpecifier = "ExportSpecifier",
  ExpressionStatement = "ExpressionStatement",
  ForInStatement = "ForInStatement",
  ForOfStatement = "ForOfStatement",
  ForStatement = "ForStatement",
  FunctionDeclaration = "FunctionDeclaration",
  FunctionExpression = "FunctionExpression",
  Identifier = "Identifier",
  IfStatement = "IfStatement",
  ImportAttribute = "ImportAttribute",
  ImportDeclaration = "ImportDeclaration",
  ImportDefaultSpecifier = "ImportDefaultSpecifier",
  ImportExpression = "ImportExpression",
  ImportNamespaceSpecifier = "ImportNamespaceSpecifier",
  ImportSpecifier = "ImportSpecifier",
  JSXAttribute = "JSXAttribute",
  JSXClosingElement = "JSXClosingElement",
  JSXClosingFragment = "JSXClosingFragment",
  JSXElement = "JSXElement",
  JSXEmptyExpression = "JSXEmptyExpression",
  JSXExpressionContainer = "JSXExpressionContainer",
  JSXFragment = "JSXFragment",
  JSXIdentifier = "JSXIdentifier",
  JSXMemberExpression = "JSXMemberExpression",
  JSXNamespacedName = "JSXNamespacedName",
  JSXOpeningElement = "JSXOpeningElement",
  JSXOpeningFragment = "JSXOpeningFragment",
  JSXSpreadAttribute = "JSXSpreadAttribute",
  JSXSpreadChild = "JSXSpreadChild",
  JSXText = "JSXText",
  LabeledStatement = "LabeledStatement",
  Literal = "Literal",
  LogicalExpression = "LogicalExpression",
  MemberExpression = "MemberExpression",
  MetaProperty = "MetaProperty",
  MethodDefinition = "MethodDefinition",
  NewExpression = "NewExpression",
  ObjectExpression = "ObjectExpression",
  ObjectPattern = "ObjectPattern",
  PrivateIdentifier = "PrivateIdentifier",
  Program = "Program",
  Property = "Property",
  PropertyDefinition = "PropertyDefinition",
  RestElement = "RestElement",
  ReturnStatement = "ReturnStatement",
  SequenceExpression = "SequenceExpression",
  SpreadElement = "SpreadElement",
  StaticBlock = "StaticBlock",
  Super = "Super",
  SwitchCase = "SwitchCase",
  SwitchStatement = "SwitchStatement",
  TaggedTemplateExpression = "TaggedTemplateExpression",
  TemplateElement = "TemplateElement",
  TemplateLiteral = "TemplateLiteral",
  ThisExpression = "ThisExpression",
  ThrowStatement = "ThrowStatement",
  TryStatement = "TryStatement",
  UnaryExpression = "UnaryExpression",
  UpdateExpression = "UpdateExpression",
  VariableDeclaration = "VariableDeclaration",
  VariableDeclarator = "VariableDeclarator",
  WhileStatement = "WhileStatement",
  WithStatement = "WithStatement",
  YieldExpression = "YieldExpression",
  TSAbstractAccessorProperty = "TSAbstractAccessorProperty",
  TSAbstractKeyword = "TSAbstractKeyword",
  TSAbstractMethodDefinition = "TSAbstractMethodDefinition",
  TSAbstractPropertyDefinition = "TSAbstractPropertyDefinition",
  TSAnyKeyword = "TSAnyKeyword",
  TSArrayType = "TSArrayType",
  TSAsExpression = "TSAsExpression",
  TSAsyncKeyword = "TSAsyncKeyword",
  TSBigIntKeyword = "TSBigIntKeyword",
  TSBooleanKeyword = "TSBooleanKeyword",
  TSCallSignatureDeclaration = "TSCallSignatureDeclaration",
  TSClassImplements = "TSClassImplements",
  TSConditionalType = "TSConditionalType",
  TSConstructorType = "TSConstructorType",
  TSConstructSignatureDeclaration = "TSConstructSignatureDeclaration",
  TSDeclareFunction = "TSDeclareFunction",
  TSDeclareKeyword = "TSDeclareKeyword",
  TSEmptyBodyFunctionExpression = "TSEmptyBodyFunctionExpression",
  TSEnumBody = "TSEnumBody",
  TSEnumDeclaration = "TSEnumDeclaration",
  TSEnumMember = "TSEnumMember",
  TSExportAssignment = "TSExportAssignment",
  TSExportKeyword = "TSExportKeyword",
  TSExternalModuleReference = "TSExternalModuleReference",
  TSFunctionType = "TSFunctionType",
  TSImportEqualsDeclaration = "TSImportEqualsDeclaration",
  TSImportType = "TSImportType",
  TSIndexedAccessType = "TSIndexedAccessType",
  TSIndexSignature = "TSIndexSignature",
  TSInferType = "TSInferType",
  TSInstantiationExpression = "TSInstantiationExpression",
  TSInterfaceBody = "TSInterfaceBody",
  TSInterfaceDeclaration = "TSInterfaceDeclaration",
  TSInterfaceHeritage = "TSInterfaceHeritage",
  TSIntersectionType = "TSIntersectionType",
  TSIntrinsicKeyword = "TSIntrinsicKeyword",
  TSLiteralType = "TSLiteralType",
  TSMappedType = "TSMappedType",
  TSMethodSignature = "TSMethodSignature",
  TSModuleBlock = "TSModuleBlock",
  TSModuleDeclaration = "TSModuleDeclaration",
  TSNamedTupleMember = "TSNamedTupleMember",
  TSNamespaceExportDeclaration = "TSNamespaceExportDeclaration",
  TSNeverKeyword = "TSNeverKeyword",
  TSNonNullExpression = "TSNonNullExpression",
  TSNullKeyword = "TSNullKeyword",
  TSNumberKeyword = "TSNumberKeyword",
  TSObjectKeyword = "TSObjectKeyword",
  TSOptionalType = "TSOptionalType",
  TSParameterProperty = "TSParameterProperty",
  TSPrivateKeyword = "TSPrivateKeyword",
  TSPropertySignature = "TSPropertySignature",
  TSProtectedKeyword = "TSProtectedKeyword",
  TSPublicKeyword = "TSPublicKeyword",
  TSQualifiedName = "TSQualifiedName",
  TSReadonlyKeyword = "TSReadonlyKeyword",
  TSRestType = "TSRestType",
  TSSatisfiesExpression = "TSSatisfiesExpression",
  TSStaticKeyword = "TSStaticKeyword",
  TSStringKeyword = "TSStringKeyword",
  TSSymbolKeyword = "TSSymbolKeyword",
  TSTemplateLiteralType = "TSTemplateLiteralType",
  TSThisType = "TSThisType",
  TSTupleType = "TSTupleType",
  TSTypeAliasDeclaration = "TSTypeAliasDeclaration",
  TSTypeAnnotation = "TSTypeAnnotation",
  TSTypeAssertion = "TSTypeAssertion",
  TSTypeLiteral = "TSTypeLiteral",
  TSTypeOperator = "TSTypeOperator",
  TSTypeParameter = "TSTypeParameter",
  TSTypeParameterDeclaration = "TSTypeParameterDeclaration",
  TSTypeParameterInstantiation = "TSTypeParameterInstantiation",
  TSTypePredicate = "TSTypePredicate",
  TSTypeQuery = "TSTypeQuery",
  TSTypeReference = "TSTypeReference",
  TSUndefinedKeyword = "TSUndefinedKeyword",
  TSUnionType = "TSUnionType",
  TSUnknownKeyword = "TSUnknownKeyword",
  TSVoidKeyword = "TSVoidKeyword"
}
declare enum AST_TOKEN_TYPES {
  Boolean = "Boolean",
  Identifier = "Identifier",
  JSXIdentifier = "JSXIdentifier",
  PrivateIdentifier = "PrivateIdentifier",
  JSXText = "JSXText",
  Keyword = "Keyword",
  Null = "Null",
  Numeric = "Numeric",
  Punctuator = "Punctuator",
  RegularExpression = "RegularExpression",
  String = "String",
  Template = "Template",
  Block = "Block",
  Line = "Line"
}
declare interface AwaitExpression extends BaseNode {
  type: AST_NODE_TYPES.AwaitExpression;
  argument: Expression;
}
declare interface BaseNode extends NodeOrTokenData {
  type: AST_NODE_TYPES;
}
declare interface BaseToken extends NodeOrTokenData {
  type: AST_TOKEN_TYPES;
  value: string;
}
declare interface BigIntLiteral extends LiteralBase {
  bigint: string;
  value: bigint | null;
}
declare type BinaryExpression = PrivateInExpression | SymmetricBinaryExpression;
declare interface BinaryOperatorToText {
  [SyntaxKind.AmpersandAmpersandToken]: '&&';
  [SyntaxKind.AmpersandToken]: '&';
  [SyntaxKind.AsteriskAsteriskToken]: '**';
  [SyntaxKind.AsteriskToken]: '*';
  [SyntaxKind.BarBarToken]: '||';
  [SyntaxKind.BarToken]: '|';
  [SyntaxKind.CaretToken]: '^';
  [SyntaxKind.EqualsEqualsEqualsToken]: '===';
  [SyntaxKind.EqualsEqualsToken]: '==';
  [SyntaxKind.ExclamationEqualsEqualsToken]: '!==';
  [SyntaxKind.ExclamationEqualsToken]: '!=';
  [SyntaxKind.GreaterThanEqualsToken]: '>=';
  [SyntaxKind.GreaterThanGreaterThanGreaterThanToken]: '>>>';
  [SyntaxKind.GreaterThanGreaterThanToken]: '>>';
  [SyntaxKind.GreaterThanToken]: '>';
  [SyntaxKind.InKeyword]: 'in';
  [SyntaxKind.InstanceOfKeyword]: 'instanceof';
  [SyntaxKind.LessThanEqualsToken]: '<=';
  [SyntaxKind.LessThanLessThanToken]: '<<';
  [SyntaxKind.LessThanToken]: '<';
  [SyntaxKind.MinusToken]: '-';
  [SyntaxKind.PercentToken]: '%';
  [SyntaxKind.PlusToken]: '+';
  [SyntaxKind.SlashToken]: '/';
}
declare type BindingName = BindingPattern | Identifier;
declare type BindingPattern = ArrayPattern | ObjectPattern;
declare interface BlockComment extends BaseToken {
  type: AST_TOKEN_TYPES.Block;
}
declare interface BlockStatement extends BaseNode {
  type: AST_NODE_TYPES.BlockStatement;
  body: Statement[];
}
declare interface BooleanLiteral extends LiteralBase {
  raw: 'false' | 'true';
  value: boolean;
}
declare interface BooleanToken extends BaseToken {
  type: AST_TOKEN_TYPES.Boolean;
}
declare interface BreakStatement extends BaseNode {
  type: AST_NODE_TYPES.BreakStatement;
  label: Identifier | null;
}
declare interface CallExpression extends BaseNode {
  type: AST_NODE_TYPES.CallExpression;
  arguments: CallExpressionArgument[];
  callee: Expression;
  optional: boolean;
  typeArguments: TSTypeParameterInstantiation | undefined;
}
declare type CallExpressionArgument = Expression | SpreadElement;
declare interface CatchClause extends BaseNode {
  type: AST_NODE_TYPES.CatchClause;
  body: BlockStatement;
  param: BindingName | null;
}
declare type ChainElement = CallExpression | MemberExpression | TSNonNullExpression;
declare interface ChainExpression extends BaseNode {
  type: AST_NODE_TYPES.ChainExpression;
  expression: ChainElement;
}
declare interface ClassBase extends BaseNode {
  /**
   * Whether the class is an abstract class.
   * @example
   * ```ts
   * abstract class Foo {}
   * ```
   */
  abstract: boolean;
  /**
   * The class body.
   */
  body: ClassBody;
  /**
   * Whether the class has been `declare`d:
   * @example
   * ```ts
   * declare class Foo {}
   * ```
   */
  declare: boolean;
  /**
   * The decorators declared for the class.
   * @example
   * ```ts
   * @deco
   * class Foo {}
   * ```
   */
  decorators: Decorator[];
  /**
   * The class's name.
   * - For a `ClassExpression` this may be `null` if the name is omitted.
   * - For a `ClassDeclaration` this may be `null` if and only if the parent is
   *   an `ExportDefaultDeclaration`.
   */
  id: Identifier | null;
  /**
   * The implemented interfaces for the class.
   */
  implements: TSClassImplements[];
  /**
   * The super class this class extends.
   */
  superClass: LeftHandSideExpression | null;
  /**
   * The generic type parameters passed to the superClass.
   */
  superTypeArguments: TSTypeParameterInstantiation | undefined;
  /**
   * The generic type parameters declared for the class.
   */
  typeParameters: TSTypeParameterDeclaration | undefined;
}
declare interface ClassBody extends BaseNode {
  type: AST_NODE_TYPES.ClassBody;
  body: ClassElement[];
}
declare type ClassDeclaration = ClassDeclarationWithName | ClassDeclarationWithOptionalName;
declare interface ClassDeclarationBase extends ClassBase {
  type: AST_NODE_TYPES.ClassDeclaration;
}
/**
 * A normal class declaration:
 * ```
 * class A {}
 * ```
 */
declare interface ClassDeclarationWithName extends ClassDeclarationBase {
  id: Identifier;
}
/**
 * Default-exported class declarations have optional names:
 * ```
 * export default class {}
 * ```
 */
declare interface ClassDeclarationWithOptionalName extends ClassDeclarationBase {
  id: Identifier | null;
}
declare type ClassElement = AccessorProperty | MethodDefinition | PropertyDefinition | StaticBlock | TSAbstractAccessorProperty | TSAbstractMethodDefinition | TSAbstractPropertyDefinition | TSIndexSignature;
declare interface ClassExpression extends ClassBase {
  type: AST_NODE_TYPES.ClassExpression;
  abstract: false;
  declare: false;
}
declare interface ClassMethodDefinitionNonComputedNameBase extends MethodDefinitionBase {
  computed: false;
  key: ClassPropertyNameNonComputed;
}
declare interface ClassPropertyDefinitionNonComputedNameBase extends PropertyDefinitionBase {
  computed: false;
  key: ClassPropertyNameNonComputed;
}
declare type ClassPropertyNameNonComputed = PrivateIdentifier | PropertyNameNonComputed;
declare type Comment = BlockComment | LineComment;
declare interface ConditionalExpression extends BaseNode {
  type: AST_NODE_TYPES.ConditionalExpression;
  alternate: Expression;
  consequent: Expression;
  test: Expression;
}
declare interface ConstDeclaration extends LetOrConstOrVarDeclarationBase {
  /**
   * In a `declare const` declaration, the declarators may have initializers, but
   * not definite assignment assertions. Each declarator cannot have both an
   * initializer and a type annotation.
   *
   * Even if the declaration has no `declare`, it may still be ambient and have
   * no initializer.
   */
  declarations: VariableDeclaratorMaybeInit[];
  kind: 'const';
}
declare interface ContinueStatement extends BaseNode {
  type: AST_NODE_TYPES.ContinueStatement;
  label: Identifier | null;
}
declare interface DebuggerStatement extends BaseNode {
  type: AST_NODE_TYPES.DebuggerStatement;
}
declare interface Decorator extends BaseNode {
  type: AST_NODE_TYPES.Decorator;
  expression: LeftHandSideExpression;
}
declare type DefaultExportDeclarations = ClassDeclarationWithOptionalName | Expression | FunctionDeclarationWithName | FunctionDeclarationWithOptionalName | TSDeclareFunction | TSEnumDeclaration | TSInterfaceDeclaration | TSModuleDeclaration | TSTypeAliasDeclaration | VariableDeclaration;
declare type DestructuringPattern = ArrayPattern | AssignmentPattern | Identifier | MemberExpression | ObjectPattern | RestElement;
declare interface DoWhileStatement extends BaseNode {
  type: AST_NODE_TYPES.DoWhileStatement;
  body: Statement;
  test: Expression;
}
declare interface EmptyStatement extends BaseNode {
  type: AST_NODE_TYPES.EmptyStatement;
}
declare type EntityName = Identifier | ThisExpression | TSQualifiedName;
declare interface ExportAllDeclaration extends BaseNode {
  type: AST_NODE_TYPES.ExportAllDeclaration;
  /**
   * The assertions declared for the export.
   * @example
   * ```ts
   * export * from 'mod' assert \{ type: 'json' \};
   * ```
   * @deprecated Replaced with {@link `attributes`}.
   */
  assertions: ImportAttribute[];
  /**
   * The attributes declared for the export.
   * @example
   * ```ts
   * export * from 'mod' with \{ type: 'json' \};
   * ```
   */
  attributes: ImportAttribute[];
  /**
   * The name for the exported items (`as X`). `null` if no name is assigned.
   */
  exported: Identifier | null;
  /**
   * The kind of the export.
   */
  exportKind: ExportKind;
  /**
   * The source module being exported from.
   */
  source: StringLiteral;
}
declare type ExportAndImportKind = 'type' | 'value';
declare interface ExportDefaultDeclaration extends BaseNode {
  type: AST_NODE_TYPES.ExportDefaultDeclaration;
  /**
   * The declaration being exported.
   */
  declaration: DefaultExportDeclarations;
  /**
   * The kind of the export. Always `value` for default exports.
   */
  exportKind: 'value';
}
declare type ExportKind = ExportAndImportKind;
declare type ExportNamedDeclaration = ExportNamedDeclarationWithoutSourceWithMultiple | ExportNamedDeclarationWithoutSourceWithSingle | ExportNamedDeclarationWithSource;
declare interface ExportNamedDeclarationBase extends BaseNode {
  type: AST_NODE_TYPES.ExportNamedDeclaration;
  /**
   * The assertions declared for the export.
   * @example
   * ```ts
   * export { foo } from 'mod' assert \{ type: 'json' \};
   * ```
   * This will be an empty array if `source` is `null`
   * @deprecated Replaced with {@link `attributes`}.
   */
  assertions: ImportAttribute[];
  /**
   * The attributes declared for the export.
   * @example
   * ```ts
   * export { foo } from 'mod' with \{ type: 'json' \};
   * ```
   * This will be an empty array if `source` is `null`
   */
  attributes: ImportAttribute[];
  /**
   * The exported declaration.
   * @example
   * ```ts
   * export const x = 1;
   * ```
   * This will be `null` if `source` is not `null`, or if there are `specifiers`
   */
  declaration: NamedExportDeclarations | null;
  /**
   * The kind of the export.
   */
  exportKind: ExportKind;
  /**
   * The source module being exported from.
   */
  source: StringLiteral | null;
  /**
   * The specifiers being exported.
   * @example
   * ```ts
   * export { a, b };
   * ```
   * This will be an empty array if `declaration` is not `null`
   */
  specifiers: ExportSpecifier[];
}
/**
 * Exporting names from the current module.
 * ```
 * export {};
 * export { a, b };
 * ```
 */
declare interface ExportNamedDeclarationWithoutSourceWithMultiple extends ExportNamedDeclarationBase {
  /**
   * This will always be an empty array.
   * @deprecated Replaced with {@link `attributes`}.
   */
  assertions: ImportAttribute[];
  /**
   * This will always be an empty array.
   */
  attributes: ImportAttribute[];
  declaration: null;
  source: null;
  specifiers: ExportSpecifierWithIdentifierLocal[];
}
/**
 * Exporting a single named declaration.
 * ```
 * export const x = 1;
 * ```
 */
declare interface ExportNamedDeclarationWithoutSourceWithSingle extends ExportNamedDeclarationBase {
  /**
   * This will always be an empty array.
   * @deprecated Replaced with {@link `attributes`}.
   */
  assertions: ImportAttribute[];
  /**
   * This will always be an empty array.
   */
  attributes: ImportAttribute[];
  declaration: NamedExportDeclarations;
  source: null;
  /**
   * This will always be an empty array.
   */
  specifiers: ExportSpecifierWithIdentifierLocal[];
}
/**
 * Export names from another module.
 * ```
 * export { a, b } from 'mod';
 * ```
 */
declare interface ExportNamedDeclarationWithSource extends ExportNamedDeclarationBase {
  declaration: null;
  source: StringLiteral;
}
declare type ExportSpecifier = ExportSpecifierWithIdentifierLocal | ExportSpecifierWithStringOrLiteralLocal;
declare interface ExportSpecifierBase extends BaseNode {
  type: AST_NODE_TYPES.ExportSpecifier;
  exported: Identifier | StringLiteral;
  exportKind: ExportKind;
  local: Identifier | StringLiteral;
}
declare interface ExportSpecifierWithIdentifierLocal extends ExportSpecifierBase {
  local: Identifier;
}
declare interface ExportSpecifierWithStringOrLiteralLocal extends ExportSpecifierBase {
  local: Identifier | StringLiteral;
}
declare type Expression = ArrayExpression | ArrayPattern | ArrowFunctionExpression | AssignmentExpression | AwaitExpression | BinaryExpression | CallExpression | ChainExpression | ClassExpression | ConditionalExpression | FunctionExpression | Identifier | ImportExpression | JSXElement | JSXFragment | LiteralExpression | LogicalExpression | MemberExpression | MetaProperty | NewExpression | ObjectExpression | ObjectPattern | SequenceExpression | Super | TaggedTemplateExpression | TemplateLiteral | ThisExpression | TSAsExpression | TSInstantiationExpression | TSNonNullExpression | TSSatisfiesExpression | TSTypeAssertion | UnaryExpression | UpdateExpression | YieldExpression;
declare interface ExpressionStatement extends BaseNode {
  type: AST_NODE_TYPES.ExpressionStatement;
  directive: string | undefined;
  expression: Expression;
}
declare type ForInitialiser = Expression | LetOrConstOrVarDeclaration;
declare interface ForInStatement extends BaseNode {
  type: AST_NODE_TYPES.ForInStatement;
  body: Statement;
  left: ForInitialiser;
  right: Expression;
}
declare type ForOfInitialiser = Expression | LetOrConstOrVarDeclaration | UsingInForOfDeclaration;
declare interface ForOfStatement extends BaseNode {
  type: AST_NODE_TYPES.ForOfStatement;
  await: boolean;
  body: Statement;
  left: ForOfInitialiser;
  right: Expression;
}
declare interface ForStatement extends BaseNode {
  type: AST_NODE_TYPES.ForStatement;
  body: Statement;
  init: Expression | ForInitialiser | null;
  test: Expression | null;
  update: Expression | null;
}
declare interface FunctionBase extends BaseNode {
  /**
   * Whether the function is async:
   * ```
   * async function foo() {}
   * const x = async function () {}
   * const x = async () => {}
   * ```
   */
  async: boolean;
  /**
   * The body of the function.
   * - For an `ArrowFunctionExpression` this may be an `Expression` or `BlockStatement`.
   * - For a `FunctionDeclaration` or `FunctionExpression` this is always a `BlockStatement`.
   * - For a `TSDeclareFunction` this is always `undefined`.
   * - For a `TSEmptyBodyFunctionExpression` this is always `null`.
   */
  body: BlockStatement | Expression | null | undefined;
  /**
   * This is only `true` if and only if the node is a `TSDeclareFunction` and it has `declare`:
   * ```
   * declare function foo() {}
   * ```
   */
  declare: boolean;
  /**
   * This is only ever `true` if and only the node is an `ArrowFunctionExpression` and the body
   * is an expression:
   * ```
   * (() => 1)
   * ```
   */
  expression: boolean;
  /**
   * Whether the function is a generator function:
   * ```
   * function *foo() {}
   * const x = function *() {}
   * ```
   * This is always `false` for arrow functions as they cannot be generators.
   */
  generator: boolean;
  /**
   * The function's name.
   * - For an `ArrowFunctionExpression` this is always `null`.
   * - For a `FunctionExpression` this may be `null` if the name is omitted.
   * - For a `FunctionDeclaration` or `TSDeclareFunction` this may be `null` if
   *   and only if the parent is an `ExportDefaultDeclaration`.
   */
  id: Identifier | null;
  /**
   * The list of parameters declared for the function.
   */
  params: Parameter[];
  /**
   * The return type annotation for the function.
   */
  returnType: TSTypeAnnotation | undefined;
  /**
   * The generic type parameter declaration for the function.
   */
  typeParameters: TSTypeParameterDeclaration | undefined;
}
declare type FunctionDeclaration = FunctionDeclarationWithName | FunctionDeclarationWithOptionalName;
declare interface FunctionDeclarationBase extends FunctionBase {
  type: AST_NODE_TYPES.FunctionDeclaration;
  body: BlockStatement;
  declare: false;
  expression: false;
}
/**
 * A normal function declaration:
 * ```
 * function f() {}
 * ```
 */
declare interface FunctionDeclarationWithName extends FunctionDeclarationBase {
  id: Identifier;
}
/**
 * Default-exported function declarations have optional names:
 * ```
 * export default function () {}
 * ```
 */
declare interface FunctionDeclarationWithOptionalName extends FunctionDeclarationBase {
  id: Identifier | null;
}
declare interface FunctionExpression extends FunctionBase {
  type: AST_NODE_TYPES.FunctionExpression;
  body: BlockStatement;
  expression: false;
}
declare type FunctionLike = ArrowFunctionExpression | FunctionDeclaration | FunctionExpression | TSDeclareFunction | TSEmptyBodyFunctionExpression;
declare interface Identifier extends BaseNode {
  type: AST_NODE_TYPES.Identifier;
  decorators: Decorator[];
  name: string;
  optional: boolean;
  typeAnnotation: TSTypeAnnotation | undefined;
}
declare interface IdentifierToken extends BaseToken {
  type: AST_TOKEN_TYPES.Identifier;
}
declare interface IfStatement extends BaseNode {
  type: AST_NODE_TYPES.IfStatement;
  alternate: Statement | null;
  consequent: Statement;
  test: Expression;
}
declare interface ImportAttribute extends BaseNode {
  type: AST_NODE_TYPES.ImportAttribute;
  key: Identifier | Literal;
  value: Literal;
}
declare type ImportClause = ImportDefaultSpecifier | ImportNamespaceSpecifier | ImportSpecifier;
declare interface ImportDeclaration extends BaseNode {
  type: AST_NODE_TYPES.ImportDeclaration;
  /**
   * The assertions declared for the export.
   * @example
   * ```ts
   * import * from 'mod' assert \{ type: 'json' \};
   * ```
   * @deprecated Replaced with {@link `attributes`}.
   */
  assertions: ImportAttribute[];
  /**
   * The attributes declared for the export.
   * @example
   * ```ts
   * import * from 'mod' with \{ type: 'json' \};
   * ```
   */
  attributes: ImportAttribute[];
  /**
   * The kind of the import.
   */
  importKind: ImportKind;
  /**
   * The source module being imported from.
   */
  source: StringLiteral;
  /**
   * The specifiers being imported.
   * If this is an empty array then either there are no specifiers:
   * ```
   * import {} from 'mod';
   * ```
   * Or it is a side-effect import:
   * ```
   * import 'mod';
   * ```
   */
  specifiers: ImportClause[];
}
declare interface ImportDefaultSpecifier extends BaseNode {
  type: AST_NODE_TYPES.ImportDefaultSpecifier;
  local: Identifier;
}
declare interface ImportExpression extends BaseNode {
  type: AST_NODE_TYPES.ImportExpression;
  /**
   * The attributes declared for the dynamic import.
   * @example
   * ```ts
   * import('mod', \{ assert: \{ type: 'json' \} \});
   * ```
   * @deprecated Replaced with {@link `options`}.
   */
  attributes: Expression | null;
  /**
   * The options bag declared for the dynamic import.
   * @example
   * ```ts
   * import('mod', \{ assert: \{ type: 'json' \} \});
   * ```
   */
  options: Expression | null;
  source: Expression;
}
declare type ImportKind = ExportAndImportKind;
declare interface ImportNamespaceSpecifier extends BaseNode {
  type: AST_NODE_TYPES.ImportNamespaceSpecifier;
  local: Identifier;
}
declare interface ImportSpecifier extends BaseNode {
  type: AST_NODE_TYPES.ImportSpecifier;
  imported: Identifier | StringLiteral;
  importKind: ImportKind;
  local: Identifier;
}
declare interface JSXAttribute extends BaseNode {
  type: AST_NODE_TYPES.JSXAttribute;
  name: JSXIdentifier | JSXNamespacedName;
  value: JSXElement | JSXExpression | Literal | null;
}
declare type JSXChild = JSXElement | JSXExpression | JSXFragment | JSXText;
declare interface JSXClosingElement extends BaseNode {
  type: AST_NODE_TYPES.JSXClosingElement;
  name: JSXTagNameExpression;
}
declare interface JSXClosingFragment extends BaseNode {
  type: AST_NODE_TYPES.JSXClosingFragment;
}
declare interface JSXElement extends BaseNode {
  type: AST_NODE_TYPES.JSXElement;
  children: JSXChild[];
  closingElement: JSXClosingElement | null;
  openingElement: JSXOpeningElement;
}
declare interface JSXEmptyExpression extends BaseNode {
  type: AST_NODE_TYPES.JSXEmptyExpression;
}
declare type JSXExpression = JSXExpressionContainer | JSXSpreadChild;
declare interface JSXExpressionContainer extends BaseNode {
  type: AST_NODE_TYPES.JSXExpressionContainer;
  expression: Expression | JSXEmptyExpression;
}
declare interface JSXFragment extends BaseNode {
  type: AST_NODE_TYPES.JSXFragment;
  children: JSXChild[];
  closingFragment: JSXClosingFragment;
  openingFragment: JSXOpeningFragment;
}
declare interface JSXIdentifier extends BaseNode {
  type: AST_NODE_TYPES.JSXIdentifier;
  name: string;
}
declare interface JSXIdentifierToken extends BaseToken {
  type: AST_TOKEN_TYPES.JSXIdentifier;
}
declare interface JSXMemberExpression extends BaseNode {
  type: AST_NODE_TYPES.JSXMemberExpression;
  object: JSXTagNameExpression;
  property: JSXIdentifier;
}
declare interface JSXNamespacedName extends BaseNode {
  type: AST_NODE_TYPES.JSXNamespacedName;
  name: JSXIdentifier;
  namespace: JSXIdentifier;
}
declare interface JSXOpeningElement extends BaseNode {
  type: AST_NODE_TYPES.JSXOpeningElement;
  attributes: (JSXAttribute | JSXSpreadAttribute)[];
  name: JSXTagNameExpression;
  selfClosing: boolean;
  typeArguments: TSTypeParameterInstantiation | undefined;
}
declare interface JSXOpeningFragment extends BaseNode {
  type: AST_NODE_TYPES.JSXOpeningFragment;
}
declare interface JSXSpreadAttribute extends BaseNode {
  type: AST_NODE_TYPES.JSXSpreadAttribute;
  argument: Expression;
}
declare interface JSXSpreadChild extends BaseNode {
  type: AST_NODE_TYPES.JSXSpreadChild;
  expression: Expression | JSXEmptyExpression;
}
declare type JSXTagNameExpression = JSXIdentifier | JSXMemberExpression | JSXNamespacedName;
declare interface JSXText extends BaseNode {
  type: AST_NODE_TYPES.JSXText;
  raw: string;
  value: string;
}
declare interface JSXTextToken extends BaseToken {
  type: AST_TOKEN_TYPES.JSXText;
}
declare interface KeywordToken extends BaseToken {
  type: AST_TOKEN_TYPES.Keyword;
}
declare interface LabeledStatement extends BaseNode {
  type: AST_NODE_TYPES.LabeledStatement;
  body: Statement;
  label: Identifier;
}
declare type LeftHandSideExpression = ArrayExpression | ArrayPattern | ArrowFunctionExpression | CallExpression | ClassExpression | FunctionExpression | Identifier | JSXElement | JSXFragment | LiteralExpression | MemberExpression | MetaProperty | ObjectExpression | ObjectPattern | SequenceExpression | Super | TaggedTemplateExpression | ThisExpression | TSAsExpression | TSNonNullExpression | TSTypeAssertion;
declare type LetOrConstOrVarDeclaration = ConstDeclaration | LetOrVarDeclaredDeclaration | LetOrVarNonDeclaredDeclaration;
declare interface LetOrConstOrVarDeclarationBase extends BaseNode {
  type: AST_NODE_TYPES.VariableDeclaration;
  /**
   * The variables declared by this declaration.
   * Always non-empty.
   * @example
   * ```ts
   * let x;
   * let y, z;
   * ```
   */
  declarations: LetOrConstOrVarDeclarator[];
  /**
   * Whether the declaration is `declare`d
   * @example
   * ```ts
   * declare const x = 1;
   * ```
   */
  declare: boolean;
  /**
   * The keyword used to declare the variable(s)
   * @example
   * ```ts
   * const x = 1;
   * let y = 2;
   * var z = 3;
   * ```
   */
  kind: 'const' | 'let' | 'var';
}
declare type LetOrConstOrVarDeclarator = VariableDeclaratorDefiniteAssignment | VariableDeclaratorMaybeInit | VariableDeclaratorNoInit;
declare interface LetOrVarDeclaredDeclaration extends LetOrConstOrVarDeclarationBase {
  /**
   * In a `declare let` declaration, the declarators must not have definite assignment
   * assertions or initializers.
   *
   * @example
   * ```ts
   * using x = 1;
   * using y =1, z = 2;
   * ```
   */
  declarations: VariableDeclaratorNoInit[];
  declare: true;
  kind: 'let' | 'var';
}
declare interface LetOrVarNonDeclaredDeclaration extends LetOrConstOrVarDeclarationBase {
  /**
   * In a `let`/`var` declaration, the declarators may have definite assignment
   * assertions or initializers, but not both.
   */
  declarations: (VariableDeclaratorDefiniteAssignment | VariableDeclaratorMaybeInit)[];
  declare: false;
  kind: 'let' | 'var';
}
declare interface LineComment extends BaseToken {
  type: AST_TOKEN_TYPES.Line;
}
declare type Literal = BigIntLiteral | BooleanLiteral | NullLiteral | NumberLiteral | RegExpLiteral | StringLiteral;
declare interface LiteralBase extends BaseNode {
  type: AST_NODE_TYPES.Literal;
  raw: string;
  value: bigint | boolean | number | string | RegExp | null;
}
declare type LiteralExpression = Literal | TemplateLiteral;
declare interface LogicalExpression extends BaseNode {
  type: AST_NODE_TYPES.LogicalExpression;
  left: Expression;
  operator: '&&' | '??' | '||';
  right: Expression;
}
declare type MemberExpression = MemberExpressionComputedName | MemberExpressionNonComputedName;
declare interface MemberExpressionBase extends BaseNode {
  computed: boolean;
  object: Expression;
  optional: boolean;
  property: Expression | Identifier | PrivateIdentifier;
}
declare interface MemberExpressionComputedName extends MemberExpressionBase {
  type: AST_NODE_TYPES.MemberExpression;
  computed: true;
  property: Expression;
}
declare interface MemberExpressionNonComputedName extends MemberExpressionBase {
  type: AST_NODE_TYPES.MemberExpression;
  computed: false;
  property: Identifier | PrivateIdentifier;
}
declare interface MetaProperty extends BaseNode {
  type: AST_NODE_TYPES.MetaProperty;
  meta: Identifier;
  property: Identifier;
}
declare type MethodDefinition = MethodDefinitionComputedName | MethodDefinitionNonComputedName;
/** this should not be directly used - instead use MethodDefinitionComputedNameBase or MethodDefinitionNonComputedNameBase */
declare interface MethodDefinitionBase extends BaseNode {
  accessibility: Accessibility | undefined;
  computed: boolean;
  decorators: Decorator[];
  key: PropertyName;
  kind: 'constructor' | 'get' | 'method' | 'set';
  optional: boolean;
  override: boolean;
  static: boolean;
  value: FunctionExpression | TSEmptyBodyFunctionExpression;
}
declare interface MethodDefinitionComputedName extends MethodDefinitionComputedNameBase {
  type: AST_NODE_TYPES.MethodDefinition;
}
declare interface MethodDefinitionComputedNameBase extends MethodDefinitionBase {
  computed: true;
  key: PropertyNameComputed;
}
declare interface MethodDefinitionNonComputedName extends ClassMethodDefinitionNonComputedNameBase {
  type: AST_NODE_TYPES.MethodDefinition;
}
declare interface MethodDefinitionNonComputedNameBase extends MethodDefinitionBase {
  computed: false;
  key: PropertyNameNonComputed;
}
declare type NamedExportDeclarations = ClassDeclarationWithName | ClassDeclarationWithOptionalName | FunctionDeclarationWithName | FunctionDeclarationWithOptionalName | TSDeclareFunction | TSEnumDeclaration | TSImportEqualsDeclaration | TSInterfaceDeclaration | TSModuleDeclaration | TSTypeAliasDeclaration | VariableDeclaration;
declare interface NewExpression extends BaseNode {
  type: AST_NODE_TYPES.NewExpression;
  arguments: CallExpressionArgument[];
  callee: Expression;
  typeArguments: TSTypeParameterInstantiation | undefined;
}
declare type Node$1 = AccessorProperty | ArrayExpression | ArrayPattern | ArrowFunctionExpression | AssignmentExpression | AssignmentPattern | AwaitExpression | BinaryExpression | BlockStatement | BreakStatement | CallExpression | CatchClause | ChainExpression | ClassBody | ClassDeclaration | ClassExpression | ConditionalExpression | ContinueStatement | DebuggerStatement | Decorator | DoWhileStatement | EmptyStatement | ExportAllDeclaration | ExportDefaultDeclaration | ExportNamedDeclaration | ExportSpecifier | ExpressionStatement | ForInStatement | ForOfStatement | ForStatement | FunctionDeclaration | FunctionExpression | Identifier | IfStatement | ImportAttribute | ImportDeclaration | ImportDefaultSpecifier | ImportExpression | ImportNamespaceSpecifier | ImportSpecifier | JSXAttribute | JSXClosingElement | JSXClosingFragment | JSXElement | JSXEmptyExpression | JSXExpressionContainer | JSXFragment | JSXIdentifier | JSXMemberExpression | JSXNamespacedName | JSXOpeningElement | JSXOpeningFragment | JSXSpreadAttribute | JSXSpreadChild | JSXText | LabeledStatement | Literal | LogicalExpression | MemberExpression | MetaProperty | MethodDefinition | NewExpression | ObjectExpression | ObjectPattern | PrivateIdentifier | Program$1 | Property | PropertyDefinition | RestElement | ReturnStatement | SequenceExpression | SpreadElement | StaticBlock | Super | SwitchCase | SwitchStatement | TaggedTemplateExpression | TemplateElement | TemplateLiteral | ThisExpression | ThrowStatement | TryStatement | TSAbstractAccessorProperty | TSAbstractKeyword | TSAbstractMethodDefinition | TSAbstractPropertyDefinition | TSAnyKeyword | TSArrayType | TSAsExpression | TSAsyncKeyword | TSBigIntKeyword | TSBooleanKeyword | TSCallSignatureDeclaration | TSClassImplements | TSConditionalType | TSConstructorType | TSConstructSignatureDeclaration | TSDeclareFunction | TSDeclareKeyword | TSEmptyBodyFunctionExpression | TSEnumBody | TSEnumDeclaration | TSEnumMember | TSExportAssignment | TSExportKeyword | TSExternalModuleReference | TSFunctionType | TSImportEqualsDeclaration | TSImportType | TSIndexedAccessType | TSIndexSignature | TSInferType | TSInstantiationExpression | TSInterfaceBody | TSInterfaceDeclaration | TSInterfaceHeritage | TSIntersectionType | TSIntrinsicKeyword | TSLiteralType | TSMappedType | TSMethodSignature | TSModuleBlock | TSModuleDeclaration | TSNamedTupleMember | TSNamespaceExportDeclaration | TSNeverKeyword | TSNonNullExpression | TSNullKeyword | TSNumberKeyword | TSObjectKeyword | TSOptionalType | TSParameterProperty | TSPrivateKeyword | TSPropertySignature | TSProtectedKeyword | TSPublicKeyword | TSQualifiedName | TSReadonlyKeyword | TSRestType | TSSatisfiesExpression | TSStaticKeyword | TSStringKeyword | TSSymbolKeyword | TSTemplateLiteralType | TSThisType | TSTupleType | TSTypeAliasDeclaration | TSTypeAnnotation | TSTypeAssertion | TSTypeLiteral | TSTypeOperator | TSTypeParameter | TSTypeParameterDeclaration | TSTypeParameterInstantiation | TSTypePredicate | TSTypeQuery | TSTypeReference | TSUndefinedKeyword | TSUnionType | TSUnknownKeyword | TSVoidKeyword | UnaryExpression | UpdateExpression | VariableDeclaration | VariableDeclarator | WhileStatement | WithStatement | YieldExpression;
declare interface NodeOrTokenData {
  type: string;
  /**
   * The source location information of the node.
   *
   * The loc property is defined as nullable by ESTree, but ESLint requires this property.
   */
  loc: SourceLocation;
  range: Range;
}
declare interface NullLiteral extends LiteralBase {
  raw: 'null';
  value: null;
}
declare interface NullToken extends BaseToken {
  type: AST_TOKEN_TYPES.Null;
}
declare interface NumberLiteral extends LiteralBase {
  value: number;
}
declare interface NumericToken extends BaseToken {
  type: AST_TOKEN_TYPES.Numeric;
}
declare interface ObjectExpression extends BaseNode {
  type: AST_NODE_TYPES.ObjectExpression;
  properties: ObjectLiteralElement[];
}
declare type ObjectLiteralElement = Property | SpreadElement;
declare interface ObjectPattern extends BaseNode {
  type: AST_NODE_TYPES.ObjectPattern;
  decorators: Decorator[];
  optional: boolean;
  properties: (Property | RestElement)[];
  typeAnnotation: TSTypeAnnotation | undefined;
}
declare type Parameter = ArrayPattern | AssignmentPattern | Identifier | ObjectPattern | RestElement | TSParameterProperty;
declare type ParameterPropertyParameter = (AssignmentPattern & {
  left: Identifier;
}) | Identifier;
declare interface Position {
  /**
   * Column number on the line (0-indexed)
   */
  column: number;
  /**
   * Line number (1-indexed)
   */
  line: number;
}
declare interface PrivateIdentifier extends BaseNode {
  type: AST_NODE_TYPES.PrivateIdentifier;
  name: string;
}
declare interface PrivateIdentifierToken extends BaseToken {
  type: AST_TOKEN_TYPES.PrivateIdentifier;
}
declare interface PrivateInExpression extends BaseNode {
  type: AST_NODE_TYPES.BinaryExpression;
  left: PrivateIdentifier;
  operator: 'in';
  right: Expression;
}
declare interface Program$1 extends NodeOrTokenData {
  type: AST_NODE_TYPES.Program;
  body: ProgramStatement[];
  comments: Comment[] | undefined;
  sourceType: 'module' | 'script';
  tokens: Token[] | undefined;
}
declare type ProgramStatement = ExportAllDeclaration | ExportDefaultDeclaration | ExportNamedDeclaration | ImportDeclaration | Statement | TSImportEqualsDeclaration | TSNamespaceExportDeclaration;
declare type Property = PropertyComputedName | PropertyNonComputedName;
declare interface PropertyBase extends BaseNode {
  type: AST_NODE_TYPES.Property;
  computed: boolean;
  key: PropertyName;
  kind: 'get' | 'init' | 'set';
  method: boolean;
  optional: boolean;
  shorthand: boolean;
  value: AssignmentPattern | BindingName | Expression | TSEmptyBodyFunctionExpression;
}
declare interface PropertyComputedName extends PropertyBase {
  computed: true;
  key: PropertyNameComputed;
}
declare type PropertyDefinition = PropertyDefinitionComputedName | PropertyDefinitionNonComputedName;
declare interface PropertyDefinitionBase extends BaseNode {
  accessibility: Accessibility | undefined;
  computed: boolean;
  declare: boolean;
  decorators: Decorator[];
  definite: boolean;
  key: PropertyName;
  optional: boolean;
  override: boolean;
  readonly: boolean;
  static: boolean;
  typeAnnotation: TSTypeAnnotation | undefined;
  value: Expression | null;
}
declare interface PropertyDefinitionComputedName extends PropertyDefinitionComputedNameBase {
  type: AST_NODE_TYPES.PropertyDefinition;
}
declare interface PropertyDefinitionComputedNameBase extends PropertyDefinitionBase {
  computed: true;
  key: PropertyNameComputed;
}
declare interface PropertyDefinitionNonComputedName extends ClassPropertyDefinitionNonComputedNameBase {
  type: AST_NODE_TYPES.PropertyDefinition;
}
declare interface PropertyDefinitionNonComputedNameBase extends PropertyDefinitionBase {
  computed: false;
  key: PropertyNameNonComputed;
}
declare type PropertyName = ClassPropertyNameNonComputed | PropertyNameComputed | PropertyNameNonComputed;
declare type PropertyNameComputed = Expression;
declare type PropertyNameNonComputed = Identifier | NumberLiteral | StringLiteral;
declare interface PropertyNonComputedName extends PropertyBase {
  computed: false;
  key: PropertyNameNonComputed;
}
declare interface PunctuatorToken extends BaseToken {
  type: AST_TOKEN_TYPES.Punctuator;
  value: ValueOf<PunctuatorTokenToText>;
}
declare interface PunctuatorTokenToText extends AssignmentOperatorToText {
  [SyntaxKind.AmpersandAmpersandToken]: '&&';
  [SyntaxKind.AmpersandToken]: '&';
  [SyntaxKind.AsteriskAsteriskToken]: '**';
  [SyntaxKind.AsteriskToken]: '*';
  [SyntaxKind.AtToken]: '@';
  [SyntaxKind.BacktickToken]: '`';
  [SyntaxKind.BarBarToken]: '||';
  [SyntaxKind.BarToken]: '|';
  [SyntaxKind.CaretToken]: '^';
  [SyntaxKind.CloseBraceToken]: '}';
  [SyntaxKind.CloseBracketToken]: ']';
  [SyntaxKind.CloseParenToken]: ')';
  [SyntaxKind.ColonToken]: ':';
  [SyntaxKind.CommaToken]: ',';
  [SyntaxKind.DotDotDotToken]: '...';
  [SyntaxKind.DotToken]: '.';
  [SyntaxKind.EqualsEqualsEqualsToken]: '===';
  [SyntaxKind.EqualsEqualsToken]: '==';
  [SyntaxKind.EqualsGreaterThanToken]: '=>';
  [SyntaxKind.ExclamationEqualsEqualsToken]: '!==';
  [SyntaxKind.ExclamationEqualsToken]: '!=';
  [SyntaxKind.ExclamationToken]: '!';
  [SyntaxKind.GreaterThanEqualsToken]: '>=';
  [SyntaxKind.GreaterThanGreaterThanGreaterThanToken]: '>>>';
  [SyntaxKind.GreaterThanGreaterThanToken]: '>>';
  [SyntaxKind.GreaterThanToken]: '>';
  [SyntaxKind.HashToken]: '#';
  [SyntaxKind.LessThanEqualsToken]: '<=';
  [SyntaxKind.LessThanLessThanToken]: '<<';
  [SyntaxKind.LessThanSlashToken]: '</';
  [SyntaxKind.LessThanToken]: '<';
  [SyntaxKind.MinusMinusToken]: '--';
  [SyntaxKind.MinusToken]: '-';
  [SyntaxKind.OpenBraceToken]: '{';
  [SyntaxKind.OpenBracketToken]: '[';
  [SyntaxKind.OpenParenToken]: '(';
  [SyntaxKind.PercentToken]: '%';
  [SyntaxKind.PlusPlusToken]: '++';
  [SyntaxKind.PlusToken]: '+';
  [SyntaxKind.QuestionDotToken]: '?.';
  [SyntaxKind.QuestionQuestionToken]: '??';
  [SyntaxKind.QuestionToken]: '?';
  [SyntaxKind.SemicolonToken]: ';';
  [SyntaxKind.SlashToken]: '/';
  [SyntaxKind.TildeToken]: '~';
}
/**
 * An array of two numbers.
 * Both numbers are a 0-based index which is the position in the array of source code characters.
 * The first is the start position of the node, the second is the end position of the node.
 */
declare type Range = [number, number];
declare interface RegExpLiteral extends LiteralBase {
  regex: {
    flags: string;
    pattern: string;
  };
  value: RegExp | null;
}
declare interface RegularExpressionToken extends BaseToken {
  type: AST_TOKEN_TYPES.RegularExpression;
  regex: {
    flags: string;
    pattern: string;
  };
}
declare interface RestElement extends BaseNode {
  type: AST_NODE_TYPES.RestElement;
  argument: DestructuringPattern;
  decorators: Decorator[];
  optional: boolean;
  typeAnnotation: TSTypeAnnotation | undefined;
  value: AssignmentPattern | undefined;
}
declare interface ReturnStatement extends BaseNode {
  type: AST_NODE_TYPES.ReturnStatement;
  argument: Expression | null;
}
declare interface SequenceExpression extends BaseNode {
  type: AST_NODE_TYPES.SequenceExpression;
  expressions: Expression[];
}
declare interface SourceLocation {
  /**
   * The position of the first character after the parsed source region
   */
  end: Position;
  /**
   * The position of the first character of the parsed source region
   */
  start: Position;
}
declare interface SpreadElement extends BaseNode {
  type: AST_NODE_TYPES.SpreadElement;
  argument: Expression;
}
declare type Statement = BlockStatement | BreakStatement | ClassDeclarationWithName | ContinueStatement | DebuggerStatement | DoWhileStatement | EmptyStatement | ExportAllDeclaration | ExportDefaultDeclaration | ExportNamedDeclaration | ExpressionStatement | ForInStatement | ForOfStatement | ForStatement | FunctionDeclarationWithName | IfStatement | ImportDeclaration | LabeledStatement | ReturnStatement | SwitchStatement | ThrowStatement | TryStatement | TSDeclareFunction | TSEnumDeclaration | TSExportAssignment | TSImportEqualsDeclaration | TSInterfaceDeclaration | TSModuleDeclaration | TSNamespaceExportDeclaration | TSTypeAliasDeclaration | VariableDeclaration | WhileStatement | WithStatement;
declare interface StaticBlock extends BaseNode {
  type: AST_NODE_TYPES.StaticBlock;
  body: Statement[];
}
declare interface StringLiteral extends LiteralBase {
  value: string;
}
declare interface StringToken extends BaseToken {
  type: AST_TOKEN_TYPES.String;
}
declare interface Super extends BaseNode {
  type: AST_NODE_TYPES.Super;
}
declare interface SwitchCase extends BaseNode {
  type: AST_NODE_TYPES.SwitchCase;
  consequent: Statement[];
  test: Expression | null;
}
declare interface SwitchStatement extends BaseNode {
  type: AST_NODE_TYPES.SwitchStatement;
  cases: SwitchCase[];
  discriminant: Expression;
}
declare interface SymmetricBinaryExpression extends BaseNode {
  type: AST_NODE_TYPES.BinaryExpression;
  left: Expression;
  operator: ValueOf<BinaryOperatorToText>;
  right: Expression;
}
declare interface TaggedTemplateExpression extends BaseNode {
  type: AST_NODE_TYPES.TaggedTemplateExpression;
  quasi: TemplateLiteral;
  tag: Expression;
  typeArguments: TSTypeParameterInstantiation | undefined;
}
declare interface TemplateElement extends BaseNode {
  type: AST_NODE_TYPES.TemplateElement;
  tail: boolean;
  value: {
    cooked: string | null;
    raw: string;
  };
}
declare interface TemplateLiteral extends BaseNode {
  type: AST_NODE_TYPES.TemplateLiteral;
  expressions: Expression[];
  quasis: TemplateElement[];
}
declare interface TemplateToken extends BaseToken {
  type: AST_TOKEN_TYPES.Template;
}
declare interface ThisExpression extends BaseNode {
  type: AST_NODE_TYPES.ThisExpression;
}
declare interface ThrowStatement extends BaseNode {
  type: AST_NODE_TYPES.ThrowStatement;
  argument: Expression;
}
declare type Token = BooleanToken | Comment | IdentifierToken | JSXIdentifierToken | JSXTextToken | KeywordToken | NullToken | NumericToken | PrivateIdentifierToken | PunctuatorToken | RegularExpressionToken | StringToken | TemplateToken;
declare interface TryStatement extends BaseNode {
  type: AST_NODE_TYPES.TryStatement;
  block: BlockStatement;
  finalizer: BlockStatement | null;
  handler: CatchClause | null;
}
declare type TSAbstractAccessorProperty = TSAbstractAccessorPropertyComputedName | TSAbstractAccessorPropertyNonComputedName;
declare interface TSAbstractAccessorPropertyComputedName extends PropertyDefinitionComputedNameBase {
  type: AST_NODE_TYPES.TSAbstractAccessorProperty;
  value: null;
}
declare interface TSAbstractAccessorPropertyNonComputedName extends PropertyDefinitionNonComputedNameBase {
  type: AST_NODE_TYPES.TSAbstractAccessorProperty;
  value: null;
}
declare interface TSAbstractKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSAbstractKeyword;
}
declare type TSAbstractMethodDefinition = TSAbstractMethodDefinitionComputedName | TSAbstractMethodDefinitionNonComputedName;
declare interface TSAbstractMethodDefinitionComputedName extends MethodDefinitionComputedNameBase {
  type: AST_NODE_TYPES.TSAbstractMethodDefinition;
}
declare interface TSAbstractMethodDefinitionNonComputedName extends MethodDefinitionNonComputedNameBase {
  type: AST_NODE_TYPES.TSAbstractMethodDefinition;
}
declare type TSAbstractPropertyDefinition = TSAbstractPropertyDefinitionComputedName | TSAbstractPropertyDefinitionNonComputedName;
declare interface TSAbstractPropertyDefinitionComputedName extends PropertyDefinitionComputedNameBase {
  type: AST_NODE_TYPES.TSAbstractPropertyDefinition;
  value: null;
}
declare interface TSAbstractPropertyDefinitionNonComputedName extends PropertyDefinitionNonComputedNameBase {
  type: AST_NODE_TYPES.TSAbstractPropertyDefinition;
  value: null;
}
declare interface TSAnyKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSAnyKeyword;
}
declare interface TSArrayType extends BaseNode {
  type: AST_NODE_TYPES.TSArrayType;
  elementType: TypeNode;
}
declare interface TSAsExpression extends BaseNode {
  type: AST_NODE_TYPES.TSAsExpression;
  expression: Expression;
  typeAnnotation: TypeNode;
}
declare interface TSAsyncKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSAsyncKeyword;
}
declare interface TSBigIntKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSBigIntKeyword;
}
declare interface TSBooleanKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSBooleanKeyword;
}
declare interface TSCallSignatureDeclaration extends TSFunctionSignatureBase {
  type: AST_NODE_TYPES.TSCallSignatureDeclaration;
}
declare interface TSClassImplements extends TSHeritageBase {
  type: AST_NODE_TYPES.TSClassImplements;
}
declare interface TSConditionalType extends BaseNode {
  type: AST_NODE_TYPES.TSConditionalType;
  checkType: TypeNode;
  extendsType: TypeNode;
  falseType: TypeNode;
  trueType: TypeNode;
}
declare interface TSConstructorType extends TSFunctionSignatureBase {
  type: AST_NODE_TYPES.TSConstructorType;
  abstract: boolean;
}
declare interface TSConstructSignatureDeclaration extends TSFunctionSignatureBase {
  type: AST_NODE_TYPES.TSConstructSignatureDeclaration;
}
declare type TSDeclareFunction = TSDeclareFunctionNoDeclare | TSDeclareFunctionWithDeclare;
declare interface TSDeclareFunctionBase extends FunctionBase {
  type: AST_NODE_TYPES.TSDeclareFunction;
  /**
   * TS1183: An implementation cannot be declared in ambient contexts.
   */
  body: undefined;
  /**
   * Whether the declaration has `declare` modifier.
   */
  declare: boolean;
  expression: false;
}
/**
 * Function declaration without the `declare` keyword:
 * ```
 * function foo(): void;
 * ```
 * This can either be an overload signature or a declaration in an ambient context
 * (e.g. `declare module`)
 */
declare interface TSDeclareFunctionNoDeclare extends TSDeclareFunctionBase {
  declare: false;
  /**
   * - TS1221: Generators are not allowed in an ambient context.
   * - TS1222: An overload signature cannot be declared as a generator.
   */
  generator: false;
}
/**
 * Function declaration with the `declare` keyword:
 * ```
 * declare function foo(): void;
 * ```
 */
declare interface TSDeclareFunctionWithDeclare extends TSDeclareFunctionBase {
  /**
   * TS1040: 'async' modifier cannot be used in an ambient context.
   */
  async: false;
  declare: true;
  /**
   * TS1221: Generators are not allowed in an ambient context.
   */
  generator: false;
}
declare interface TSDeclareKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSDeclareKeyword;
}
declare interface TSEmptyBodyFunctionExpression extends FunctionBase {
  type: AST_NODE_TYPES.TSEmptyBodyFunctionExpression;
  body: null;
  id: null;
}
declare interface TSEnumBody extends BaseNode {
  type: AST_NODE_TYPES.TSEnumBody;
  members: TSEnumMember[];
}
declare interface TSEnumDeclaration extends BaseNode {
  type: AST_NODE_TYPES.TSEnumDeclaration;
  /**
   * The body of the enum.
   */
  body: TSEnumBody;
  /**
   * Whether this is a `const` enum.
   * @example
   * ```ts
   * const enum Foo {}
   * ```
   */
  const: boolean;
  /**
   * Whether this is a `declare`d enum.
   * @example
   * ```ts
   * declare enum Foo {}
   * ```
   */
  declare: boolean;
  /**
   * The enum name.
   */
  id: Identifier;
  /**
   * The enum members.
   * @deprecated Use {@link body} instead.
   */
  members: TSEnumMember[];
}
declare interface TSEnumMember extends BaseNode {
  type: AST_NODE_TYPES.TSEnumMember;
  id: Identifier | StringLiteral;
  initializer: Expression | undefined;
  /**
   * @deprecated the enum member is always non-computed.
   */
  computed: boolean;
}
declare interface TSExportAssignment extends BaseNode {
  type: AST_NODE_TYPES.TSExportAssignment;
  expression: Expression;
}
declare interface TSExportKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSExportKeyword;
}
declare interface TSExternalModuleReference extends BaseNode {
  type: AST_NODE_TYPES.TSExternalModuleReference;
  expression: StringLiteral;
}
declare interface TSFunctionSignatureBase extends BaseNode {
  params: Parameter[];
  returnType: TSTypeAnnotation | undefined;
  typeParameters: TSTypeParameterDeclaration | undefined;
}
declare interface TSFunctionType extends TSFunctionSignatureBase {
  type: AST_NODE_TYPES.TSFunctionType;
}
declare interface TSHeritageBase extends BaseNode {
  expression: Expression;
  typeArguments: TSTypeParameterInstantiation | undefined;
}
declare type TSImportEqualsDeclaration = TSImportEqualsNamespaceDeclaration | TSImportEqualsRequireDeclaration;
declare interface TSImportEqualsDeclarationBase extends BaseNode {
  type: AST_NODE_TYPES.TSImportEqualsDeclaration;
  /**
   * The locally imported name.
   */
  id: Identifier;
  /**
   * The kind of the import. Always `'value'` unless `moduleReference` is a
   * `TSExternalModuleReference`.
   */
  importKind: ImportKind;
  /**
   * The value being aliased.
   * @example
   * ```ts
   * import F1 = A;
   * import F2 = A.B.C;
   * import F3 = require('mod');
   * ```
   */
  moduleReference: Identifier | TSExternalModuleReference | TSQualifiedName;
}
declare interface TSImportEqualsNamespaceDeclaration extends TSImportEqualsDeclarationBase {
  /**
   * The kind of the import.
   */
  importKind: 'value';
  /**
   * The value being aliased.
   * ```
   * import F1 = A;
   * import F2 = A.B.C;
   * ```
   */
  moduleReference: Identifier | TSQualifiedName;
}
declare interface TSImportEqualsRequireDeclaration extends TSImportEqualsDeclarationBase {
  /**
   * The kind of the import.
   */
  importKind: ImportKind;
  /**
   * The value being aliased.
   * ```
   * import F3 = require('mod');
   * ```
   */
  moduleReference: TSExternalModuleReference;
}
declare interface TSImportType extends BaseNode {
  type: AST_NODE_TYPES.TSImportType;
  /** @deprecated Use {@link `source`} instead. */
  argument: TypeNode;
  options: ObjectExpression | null;
  qualifier: EntityName | null;
  source: StringLiteral;
  typeArguments: TSTypeParameterInstantiation | null;
}
declare interface TSIndexedAccessType extends BaseNode {
  type: AST_NODE_TYPES.TSIndexedAccessType;
  indexType: TypeNode;
  objectType: TypeNode;
}
declare interface TSIndexSignature extends BaseNode {
  type: AST_NODE_TYPES.TSIndexSignature;
  accessibility: Accessibility | undefined;
  parameters: Parameter[];
  readonly: boolean;
  static: boolean;
  typeAnnotation: TSTypeAnnotation | undefined;
}
declare interface TSInferType extends BaseNode {
  type: AST_NODE_TYPES.TSInferType;
  typeParameter: TSTypeParameter;
}
declare interface TSInstantiationExpression extends BaseNode {
  type: AST_NODE_TYPES.TSInstantiationExpression;
  expression: Expression;
  typeArguments: TSTypeParameterInstantiation;
}
declare interface TSInterfaceBody extends BaseNode {
  type: AST_NODE_TYPES.TSInterfaceBody;
  body: TypeElement[];
}
declare interface TSInterfaceDeclaration extends BaseNode {
  type: AST_NODE_TYPES.TSInterfaceDeclaration;
  /**
   * The body of the interface
   */
  body: TSInterfaceBody;
  /**
   * Whether the interface was `declare`d
   */
  declare: boolean;
  /**
   * The types this interface `extends`
   */
  extends: TSInterfaceHeritage[];
  /**
   * The name of this interface
   */
  id: Identifier;
  /**
   * The generic type parameters declared for the interface. Empty declaration
   * (`<>`) is different from no declaration.
   */
  typeParameters: TSTypeParameterDeclaration | undefined;
}
declare interface TSInterfaceHeritage extends TSHeritageBase {
  type: AST_NODE_TYPES.TSInterfaceHeritage;
}
declare interface TSIntersectionType extends BaseNode {
  type: AST_NODE_TYPES.TSIntersectionType;
  types: TypeNode[];
}
declare interface TSIntrinsicKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSIntrinsicKeyword;
}
declare interface TSLiteralType extends BaseNode {
  type: AST_NODE_TYPES.TSLiteralType;
  literal: Exclude<LiteralExpression, NullLiteral | RegExpLiteral> | UnaryExpressionMinus | UnaryExpressionPlus;
}
declare interface TSMappedType extends BaseNode {
  type: AST_NODE_TYPES.TSMappedType;
  constraint: TypeNode;
  key: Identifier;
  nameType: TypeNode | null;
  optional: boolean | '+' | '-' | undefined;
  readonly: boolean | '+' | '-' | undefined;
  typeAnnotation: TypeNode | undefined;
  /** @deprecated Use {@link `constraint`} and {@link `key`} instead. */
  typeParameter: TSTypeParameter;
}
declare type TSMethodSignature = TSMethodSignatureComputedName | TSMethodSignatureNonComputedName;
declare interface TSMethodSignatureBase extends BaseNode {
  type: AST_NODE_TYPES.TSMethodSignature;
  accessibility: Accessibility | undefined;
  computed: boolean;
  key: PropertyName;
  kind: 'get' | 'method' | 'set';
  optional: boolean;
  params: Parameter[];
  readonly: boolean;
  returnType: TSTypeAnnotation | undefined;
  static: boolean;
  typeParameters: TSTypeParameterDeclaration | undefined;
}
declare interface TSMethodSignatureComputedName extends TSMethodSignatureBase {
  computed: true;
  key: PropertyNameComputed;
}
declare interface TSMethodSignatureNonComputedName extends TSMethodSignatureBase {
  computed: false;
  key: PropertyNameNonComputed;
}
declare interface TSModuleBlock extends BaseNode {
  type: AST_NODE_TYPES.TSModuleBlock;
  body: ProgramStatement[];
}
declare type TSModuleDeclaration = TSModuleDeclarationGlobal | TSModuleDeclarationModule | TSModuleDeclarationNamespace;
declare interface TSModuleDeclarationBase extends BaseNode {
  type: AST_NODE_TYPES.TSModuleDeclaration;
  /**
   * The body of the module.
   * This can only be `undefined` for the code `declare module 'mod';`
   */
  body?: TSModuleBlock;
  /**
   * Whether the module is `declare`d
   * @example
   * ```ts
   * declare namespace F {}
   * ```
   */
  declare: boolean;
  /**
   * Whether this is a global declaration
   * @example
   * ```ts
   * declare global {}
   * ```
   *
   * @deprecated Use {@link kind} instead
   */
  global: boolean;
  /**
   * The name of the module
   * ```
   * namespace A {}
   * namespace A.B.C {}
   * module 'a' {}
   * ```
   */
  id: Identifier | Literal | TSQualifiedName;
  /**
   * The keyword used to define this module declaration
   * @example
   * ```ts
   * namespace Foo {}
   * ^^^^^^^^^
   *
   * module 'foo' {}
   * ^^^^^^
   *
   * global {}
   * ^^^^^^
   * ```
   */
  kind: TSModuleDeclarationKind;
}
declare interface TSModuleDeclarationGlobal extends TSModuleDeclarationBase {
  body: TSModuleBlock;
  /**
   * This will always be an Identifier with name `global`
   */
  id: Identifier;
  kind: 'global';
}
declare type TSModuleDeclarationKind = 'global' | 'module' | 'namespace';
declare type TSModuleDeclarationModule = TSModuleDeclarationModuleWithIdentifierId | TSModuleDeclarationModuleWithStringId;
declare interface TSModuleDeclarationModuleBase extends TSModuleDeclarationBase {
  kind: 'module';
}
/**
 * The legacy module declaration, replaced with namespace declarations.
 * ```
 * module A {}
 * ```
 */
declare interface TSModuleDeclarationModuleWithIdentifierId extends TSModuleDeclarationModuleBase {
  body: TSModuleBlock;
  id: Identifier;
  kind: 'module';
}
declare type TSModuleDeclarationModuleWithStringId = TSModuleDeclarationModuleWithStringIdDeclared | TSModuleDeclarationModuleWithStringIdNotDeclared;
/**
 * A string module declaration that is declared:
 * ```
 * declare module 'foo' {}
 * declare module 'foo';
 * ```
 */
declare interface TSModuleDeclarationModuleWithStringIdDeclared extends TSModuleDeclarationModuleBase {
  body?: TSModuleBlock;
  declare: true;
  id: StringLiteral;
  kind: 'module';
}
/**
 * A string module declaration that is not declared:
 * ```
 * module 'foo' {}
 * ```
 */
declare interface TSModuleDeclarationModuleWithStringIdNotDeclared extends TSModuleDeclarationModuleBase {
  body: TSModuleBlock;
  declare: false;
  id: StringLiteral;
  kind: 'module';
}
declare interface TSModuleDeclarationNamespace extends TSModuleDeclarationBase {
  body: TSModuleBlock;
  id: Identifier | TSQualifiedName;
  kind: 'namespace';
}
declare interface TSNamedTupleMember extends BaseNode {
  type: AST_NODE_TYPES.TSNamedTupleMember;
  elementType: TypeNode;
  label: Identifier;
  optional: boolean;
}
/**
 * For the following declaration:
 * ```
 * export as namespace X;
 * ```
 */
declare interface TSNamespaceExportDeclaration extends BaseNode {
  type: AST_NODE_TYPES.TSNamespaceExportDeclaration;
  /**
   * The name of the global variable that's exported as namespace
   */
  id: Identifier;
}
declare interface TSNeverKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSNeverKeyword;
}
declare interface TSNonNullExpression extends BaseNode {
  type: AST_NODE_TYPES.TSNonNullExpression;
  expression: Expression;
}
declare interface TSNullKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSNullKeyword;
}
declare interface TSNumberKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSNumberKeyword;
}
declare interface TSObjectKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSObjectKeyword;
}
declare interface TSOptionalType extends BaseNode {
  type: AST_NODE_TYPES.TSOptionalType;
  typeAnnotation: TypeNode;
}
declare interface TSParameterProperty extends BaseNode {
  type: AST_NODE_TYPES.TSParameterProperty;
  accessibility: Accessibility | undefined;
  decorators: Decorator[];
  override: boolean;
  parameter: ParameterPropertyParameter;
  readonly: boolean;
  static: boolean;
}
declare interface TSPrivateKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSPrivateKeyword;
}
declare type TSPropertySignature = TSPropertySignatureComputedName | TSPropertySignatureNonComputedName;
declare interface TSPropertySignatureBase extends BaseNode {
  type: AST_NODE_TYPES.TSPropertySignature;
  accessibility: Accessibility | undefined;
  computed: boolean;
  key: PropertyName;
  optional: boolean;
  readonly: boolean;
  static: boolean;
  typeAnnotation: TSTypeAnnotation | undefined;
}
declare interface TSPropertySignatureComputedName extends TSPropertySignatureBase {
  computed: true;
  key: PropertyNameComputed;
}
declare interface TSPropertySignatureNonComputedName extends TSPropertySignatureBase {
  computed: false;
  key: PropertyNameNonComputed;
}
declare interface TSProtectedKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSProtectedKeyword;
}
declare interface TSPublicKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSPublicKeyword;
}
declare interface TSQualifiedName extends BaseNode {
  type: AST_NODE_TYPES.TSQualifiedName;
  left: EntityName;
  right: Identifier;
}
declare interface TSReadonlyKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSReadonlyKeyword;
}
declare interface TSRestType extends BaseNode {
  type: AST_NODE_TYPES.TSRestType;
  typeAnnotation: TypeNode;
}
declare interface TSSatisfiesExpression extends BaseNode {
  type: AST_NODE_TYPES.TSSatisfiesExpression;
  expression: Expression;
  typeAnnotation: TypeNode;
}
declare interface TSStaticKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSStaticKeyword;
}
declare interface TSStringKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSStringKeyword;
}
declare interface TSSymbolKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSSymbolKeyword;
}
declare interface TSTemplateLiteralType extends BaseNode {
  type: AST_NODE_TYPES.TSTemplateLiteralType;
  quasis: TemplateElement[];
  types: TypeNode[];
}
declare interface TSThisType extends BaseNode {
  type: AST_NODE_TYPES.TSThisType;
}
declare interface TSTupleType extends BaseNode {
  type: AST_NODE_TYPES.TSTupleType;
  elementTypes: TypeNode[];
}
declare interface TSTypeAliasDeclaration extends BaseNode {
  type: AST_NODE_TYPES.TSTypeAliasDeclaration;
  /**
   * Whether the type was `declare`d.
   * @example
   * ```ts
   * declare type T = 1;
   * ```
   */
  declare: boolean;
  /**
   * The name of the type.
   */
  id: Identifier;
  /**
   * The "value" (type) of the declaration
   */
  typeAnnotation: TypeNode;
  /**
   * The generic type parameters declared for the type. Empty declaration
   * (`<>`) is different from no declaration.
   */
  typeParameters: TSTypeParameterDeclaration | undefined;
}
declare interface TSTypeAnnotation extends BaseNode {
  type: AST_NODE_TYPES.TSTypeAnnotation;
  typeAnnotation: TypeNode;
}
declare interface TSTypeAssertion extends BaseNode {
  type: AST_NODE_TYPES.TSTypeAssertion;
  expression: Expression;
  typeAnnotation: TypeNode;
}
declare interface TSTypeLiteral extends BaseNode {
  type: AST_NODE_TYPES.TSTypeLiteral;
  members: TypeElement[];
}
declare interface TSTypeOperator extends BaseNode {
  type: AST_NODE_TYPES.TSTypeOperator;
  operator: 'keyof' | 'readonly' | 'unique';
  typeAnnotation: TypeNode | undefined;
}
declare interface TSTypeParameter extends BaseNode {
  type: AST_NODE_TYPES.TSTypeParameter;
  const: boolean;
  constraint: TypeNode | undefined;
  default: TypeNode | undefined;
  in: boolean;
  name: Identifier;
  out: boolean;
}
declare interface TSTypeParameterDeclaration extends BaseNode {
  type: AST_NODE_TYPES.TSTypeParameterDeclaration;
  params: TSTypeParameter[];
}
declare interface TSTypeParameterInstantiation extends BaseNode {
  type: AST_NODE_TYPES.TSTypeParameterInstantiation;
  params: TypeNode[];
}
declare interface TSTypePredicate extends BaseNode {
  type: AST_NODE_TYPES.TSTypePredicate;
  asserts: boolean;
  parameterName: Identifier | TSThisType;
  typeAnnotation: TSTypeAnnotation | null;
}
declare interface TSTypeQuery extends BaseNode {
  type: AST_NODE_TYPES.TSTypeQuery;
  exprName: EntityName | TSImportType;
  typeArguments: TSTypeParameterInstantiation | undefined;
}
declare interface TSTypeReference extends BaseNode {
  type: AST_NODE_TYPES.TSTypeReference;
  typeArguments: TSTypeParameterInstantiation | undefined;
  typeName: EntityName;
}
declare interface TSUndefinedKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSUndefinedKeyword;
}
declare interface TSUnionType extends BaseNode {
  type: AST_NODE_TYPES.TSUnionType;
  types: TypeNode[];
}
declare interface TSUnknownKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSUnknownKeyword;
}
declare interface TSVoidKeyword extends BaseNode {
  type: AST_NODE_TYPES.TSVoidKeyword;
}
declare type TypeElement = TSCallSignatureDeclaration | TSConstructSignatureDeclaration | TSIndexSignature | TSMethodSignature | TSPropertySignature;
declare type TypeNode = TSAbstractKeyword | TSAnyKeyword | TSArrayType | TSAsyncKeyword | TSBigIntKeyword | TSBooleanKeyword | TSConditionalType | TSConstructorType | TSDeclareKeyword | TSExportKeyword | TSFunctionType | TSImportType | TSIndexedAccessType | TSInferType | TSIntersectionType | TSIntrinsicKeyword | TSLiteralType | TSMappedType | TSNamedTupleMember | TSNeverKeyword | TSNullKeyword | TSNumberKeyword | TSObjectKeyword | TSOptionalType | TSPrivateKeyword | TSProtectedKeyword | TSPublicKeyword | TSQualifiedName | TSReadonlyKeyword | TSRestType | TSStaticKeyword | TSStringKeyword | TSSymbolKeyword | TSTemplateLiteralType | TSThisType | TSTupleType | TSTypeLiteral | TSTypeOperator | TSTypePredicate | TSTypeQuery | TSTypeReference | TSUndefinedKeyword | TSUnionType | TSUnknownKeyword | TSVoidKeyword;
declare type UnaryExpression = UnaryExpressionBitwiseNot | UnaryExpressionDelete | UnaryExpressionMinus | UnaryExpressionNot | UnaryExpressionPlus | UnaryExpressionTypeof | UnaryExpressionVoid;
declare interface UnaryExpressionBase extends BaseNode {
  argument: Expression;
  operator: string;
  prefix: boolean;
}
declare type UnaryExpressionBitwiseNot = UnaryExpressionSpecific<'~'>;
declare type UnaryExpressionDelete = UnaryExpressionSpecific<'delete'>;
declare type UnaryExpressionMinus = UnaryExpressionSpecific<'-'>;
declare type UnaryExpressionNot = UnaryExpressionSpecific<'!'>;
declare type UnaryExpressionPlus = UnaryExpressionSpecific<'+'>;
declare interface UnaryExpressionSpecific<T extends string> extends UnaryExpressionBase {
  type: AST_NODE_TYPES.UnaryExpression;
  operator: T;
}
declare type UnaryExpressionTypeof = UnaryExpressionSpecific<'typeof'>;
declare type UnaryExpressionVoid = UnaryExpressionSpecific<'void'>;
declare interface UpdateExpression extends UnaryExpressionBase {
  type: AST_NODE_TYPES.UpdateExpression;
  operator: '++' | '--';
}
declare type UsingDeclaration = UsingInForOfDeclaration | UsingInNormalContextDeclaration;
declare interface UsingDeclarationBase extends BaseNode {
  type: AST_NODE_TYPES.VariableDeclaration;
  /**
   * This value will always be `false`
   * because 'declare' modifier cannot appear on a 'using' declaration.
   */
  declare: false;
  /**
   * The keyword used to declare the variable(s)
   * @example
   * ```ts
   * using x = 1;
   * await using y = 2;
   * ```
   */
  kind: 'await using' | 'using';
}
declare type UsingDeclarator = UsingInForOfDeclarator | UsingInNormalContextDeclarator;
declare interface UsingInForOfDeclaration extends UsingDeclarationBase {
  /**
   * The variables declared by this declaration.
   * Always has exactly one element.
   * @example
   * ```ts
   * for (using x of y) {}
   * ```
   */
  declarations: [UsingInForOfDeclarator];
}
declare interface UsingInForOfDeclarator extends VariableDeclaratorBase {
  definite: false;
  id: Identifier;
  init: null;
}
declare interface UsingInNormalContextDeclaration extends UsingDeclarationBase {
  /**
   * The variables declared by this declaration.
   * Always non-empty.
   * @example
   * ```ts
   * using x = 1;
   * using y = 1, z = 2;
   * ```
   */
  declarations: UsingInNormalContextDeclarator[];
}
declare interface UsingInNormalContextDeclarator extends VariableDeclaratorBase {
  definite: false;
  id: Identifier;
  init: Expression;
}
declare type ValueOf<T> = T[keyof T];
declare type VariableDeclaration = LetOrConstOrVarDeclaration | UsingDeclaration;
declare type VariableDeclarator = LetOrConstOrVarDeclarator | UsingDeclarator;
declare interface VariableDeclaratorBase extends BaseNode {
  type: AST_NODE_TYPES.VariableDeclarator;
  /**
   * Whether there's definite assignment assertion (`let x!: number`).
   * If `true`, then: `id` must be an identifier with a type annotation,
   * `init` must be `null`, and the declarator must be a `var`/`let` declarator.
   */
  definite: boolean;
  /**
   * The name(s) of the variable(s).
   */
  id: BindingName;
  /**
   * The initializer expression of the variable. Must be present for `const` unless
   * in a `declare const`.
   */
  init: Expression | null;
}
declare interface VariableDeclaratorDefiniteAssignment extends VariableDeclaratorBase {
  definite: true;
  /**
   * The name of the variable. Must have a type annotation.
   */
  id: Identifier;
  init: null;
}
declare interface VariableDeclaratorMaybeInit extends VariableDeclaratorBase {
  definite: false;
}
declare interface VariableDeclaratorNoInit extends VariableDeclaratorBase {
  definite: false;
  init: null;
}
declare interface WhileStatement extends BaseNode {
  type: AST_NODE_TYPES.WhileStatement;
  body: Statement;
  test: Expression;
}
declare interface WithStatement extends BaseNode {
  type: AST_NODE_TYPES.WithStatement;
  body: Statement;
  object: Expression;
}
declare interface YieldExpression extends BaseNode {
  type: AST_NODE_TYPES.YieldExpression;
  argument: Expression | null;
  delegate: boolean;
}
//#endregion
//#region node_modules/@typescript-eslint/types/dist/ts-estree.d.ts
declare module './generated/ast-spec' {
  interface BaseNode {
    parent: Node$1;
  }
  interface Program {
    /**
     * @remarks This never-used property exists only as a convenience for code that tries to access node parents repeatedly.
     */
    parent?: never;
  }
  interface AccessorPropertyComputedName {
    parent: ClassBody;
  }
  interface AccessorPropertyNonComputedName {
    parent: ClassBody;
  }
  interface TSAbstractAccessorPropertyComputedName {
    parent: ClassBody;
  }
  interface TSAbstractAccessorPropertyNonComputedName {
    parent: ClassBody;
  }
  interface VariableDeclaratorDefiniteAssignment {
    parent: VariableDeclaration;
  }
  interface VariableDeclaratorMaybeInit {
    parent: VariableDeclaration;
  }
  interface VariableDeclaratorNoInit {
    parent: VariableDeclaration;
  }
  interface UsingInForOfDeclarator {
    parent: VariableDeclaration;
  }
  interface UsingInNormalContextDeclarator {
    parent: VariableDeclaration;
  }
  interface CatchClause {
    parent: TryStatement;
  }
  interface ClassBody {
    parent: ClassDeclaration | ClassExpression;
  }
  interface ImportAttribute {
    parent: ExportAllDeclaration | ExportNamedDeclaration | ImportDeclaration | TSImportType;
  }
  interface ImportDefaultSpecifier {
    parent: ImportDeclaration;
  }
  interface ImportNamespaceSpecifier {
    parent: ImportDeclaration;
  }
  interface ImportSpecifier {
    parent: ExportAllDeclaration | ExportNamedDeclaration | ImportDeclaration;
  }
  interface ExportDefaultDeclaration {
    parent: BlockStatement | Program$1 | TSModuleBlock;
  }
  interface ExportNamedDeclarationWithoutSourceWithMultiple {
    parent: BlockStatement | Program$1 | TSModuleBlock;
  }
  interface ExportNamedDeclarationWithoutSourceWithSingle {
    parent: BlockStatement | Program$1 | TSModuleBlock;
  }
  interface ExportNamedDeclarationWithSource {
    parent: BlockStatement | Program$1 | TSModuleBlock;
  }
  interface FunctionDeclarationWithName {
    parent: BlockStatement | ExportDefaultDeclaration | ExportNamedDeclaration | Program$1;
  }
  interface FunctionDeclarationWithOptionalName {
    parent: ExportDefaultDeclaration;
  }
  interface JSXAttribute {
    parent: JSXOpeningElement;
  }
  interface JSXClosingElement {
    parent: JSXElement;
  }
  interface JSXClosingFragment {
    parent: JSXFragment;
  }
  interface JSXOpeningElement {
    parent: JSXElement;
  }
  interface JSXOpeningFragment {
    parent: JSXFragment;
  }
  interface JSXSpreadAttribute {
    parent: JSXOpeningElement;
  }
  interface MethodDefinitionComputedName {
    parent: ClassBody;
  }
  interface MethodDefinitionNonComputedName {
    parent: ClassBody;
  }
  interface TSAbstractMethodDefinitionComputedName {
    parent: ClassBody;
  }
  interface TSAbstractMethodDefinitionNonComputedName {
    parent: ClassBody;
  }
  interface PropertyComputedName {
    parent: ObjectExpression | ObjectPattern;
  }
  interface PropertyNonComputedName {
    parent: ObjectExpression | ObjectPattern;
  }
  interface PropertyDefinitionComputedName {
    parent: ClassBody;
  }
  interface PropertyDefinitionNonComputedName {
    parent: ClassBody;
  }
  interface TSAbstractPropertyDefinitionComputedName {
    parent: ClassBody;
  }
  interface TSAbstractPropertyDefinitionNonComputedName {
    parent: ClassBody;
  }
  interface SpreadElement {
    parent: ArrayExpression | CallExpression | NewExpression | ObjectExpression;
  }
  interface StaticBlock {
    parent: ClassBody;
  }
  interface SwitchCase {
    parent: SwitchStatement;
  }
  interface TemplateElement {
    parent: TemplateLiteral | TSTemplateLiteralType;
  }
  interface TSCallSignatureDeclaration {
    parent: TSInterfaceBody | TSTypeLiteral;
  }
  interface TSConstructSignatureDeclaration {
    parent: TSInterfaceBody | TSTypeLiteral;
  }
  interface TSClassImplements {
    parent: ClassDeclaration | ClassExpression;
  }
  interface TSEnumBody {
    parent: TSEnumDeclaration;
  }
  interface TSEnumMember {
    parent: TSEnumBody;
  }
  interface TSIndexSignature {
    parent: ClassBody | TSInterfaceBody | TSTypeLiteral;
  }
  interface TSInterfaceBody {
    parent: TSInterfaceDeclaration;
  }
  interface TSInterfaceHeritage {
    parent: TSInterfaceBody;
  }
  interface TSMethodSignatureComputedName {
    parent: TSInterfaceBody | TSTypeLiteral;
  }
  interface TSMethodSignatureNonComputedName {
    parent: TSInterfaceBody | TSTypeLiteral;
  }
  interface TSModuleBlock {
    parent: TSModuleDeclaration;
  }
  interface TSParameterProperty {
    parent: FunctionLike;
  }
  interface TSPropertySignatureComputedName {
    parent: TSInterfaceBody | TSTypeLiteral;
  }
  interface TSPropertySignatureNonComputedName {
    parent: TSInterfaceBody | TSTypeLiteral;
  }
  interface TSTypeParameter {
    parent: TSInferType | TSMappedType | TSTypeParameterDeclaration;
  }
  interface ExportSpecifierWithIdentifierLocal {
    parent: ExportNamedDeclaration;
  }
  interface ExportSpecifierWithStringOrLiteralLocal {
    parent: ExportNamedDeclaration;
  }
}
//#endregion
//#region node_modules/@typescript-eslint/typescript-estree/dist/ts-estree/ts-nodes.d.ts
declare module 'typescript' {
  interface AssertClause extends undefined {}
  interface AssertEntry extends undefined {}
  interface SatisfiesExpression extends undefined {}
  interface JsxNamespacedName extends undefined {}
  interface ImportAttribute extends undefined {}
  interface ImportAttributes extends undefined {}
}
//#endregion
//#region node_modules/@typescript-eslint/typescript-estree/dist/parseSettings/index.d.ts
declare module 'typescript' {
  enum JSDocParsingMode {}
}
declare module 'typescript/lib/tsserverlibrary' {
  enum JSDocParsingMode {}
}
/**
 * Internal settings used by the parser to run on a file.
 */
//#endregion
//#region src/external/token-store/index.d.ts
type SkipOptions = number | ((token: Token$1) => boolean) | {
  includeComments?: boolean;
  filter?: (token: Token$1) => boolean;
  skip?: number;
};
type CountOptions = number | ((token: Token$1) => boolean) | {
  includeComments?: boolean;
  filter?: (token: Token$1) => boolean;
  count?: number;
};
/**
 * The token store.
 *
 * This class provides methods to get tokens by locations as fast as possible.
 * The methods are a part of public API, so we should be careful if it changes this class.
 *
 * People can get tokens in O(1) by the hash map which is mapping from the location of tokens/comments to tokens.
 * Also people can get a mix of tokens and comments in O(log k), the k is the number of comments.
 * Assuming that comments to be much fewer than tokens, this does not make hash map from token's locations to comments to reduce memory cost.
 * This uses binary-searching instead for comments.
 */
declare class TokenStore {
  private _tokens;
  private _comments;
  private _indexMap;
  /**
   * Initializes this token store.
   * @param tokens - The array of tokens.
   * @param comments - The array of comments.
   */
  constructor(tokens: Token$1[], comments: Token$1[]);
  /**
   * Gets the token starting at the specified index.
   * @param offset - Index of the start of the token's range.
   * @param options - The option object.
   * @returns The token starting at index, or null if no such token.
   */
  getTokenByRangeStart(offset: number, options?: {
    includeComments: boolean;
  }): Token$1 | null;
  /**
   * Gets the first token of the given node.
   * @param node - The AST node.
   * @param options - The option object.
   * @returns An object representing the token.
   */
  getFirstToken(node: HasLocation, options?: SkipOptions): Token$1 | null;
  /**
   * Gets the last token of the given node.
   * @param node - The AST node.
   * @param options - The option object.
   * @returns An object representing the token.
   */
  getLastToken(node: HasLocation, options?: SkipOptions): Token$1 | null;
  /**
   * Gets the token that precedes a given node or token.
   * @param node - The AST node or token.
   * @param options - The option object.
   * @returns An object representing the token.
   */
  getTokenBefore(node: HasLocation, options?: SkipOptions): Token$1 | null;
  /**
   * Gets the token that follows a given node or token.
   * @param node - The AST node or token.
   * @param options - The option object.
   * @returns An object representing the token.
   */
  getTokenAfter(node: HasLocation, options?: SkipOptions): Token$1 | null;
  /**
   * Gets the first token between two non-overlapping nodes.
   * @param left - Node before the desired token range.
   * @param right - Node after the desired token range.
   * @param options - The option object.
   * @returns An object representing the token.
   */
  getFirstTokenBetween(left: HasLocation, right: HasLocation, options?: SkipOptions): Token$1 | null;
  /**
   * Gets the last token between two non-overlapping nodes.
   * @param left Node before the desired token range.
   * @param right Node after the desired token range.
   * @param options - The option object.
   * @returns An object representing the token.
   */
  getLastTokenBetween(left: HasLocation, right: HasLocation, options?: SkipOptions): Token$1 | null;
  /**
   * Gets the token that precedes a given node or token in the token stream.
   * This is defined for backward compatibility. Use `includeComments` option instead.
   * TODO: We have a plan to remove this in a future major version.
   * @param node The AST node or token.
   * @param skip A number of tokens to skip.
   * @returns An object representing the token.
   * @deprecated
   */
  getTokenOrCommentBefore(node: HasLocation, skip?: number): Token$1 | null;
  /**
   * Gets the token that follows a given node or token in the token stream.
   * This is defined for backward compatibility. Use `includeComments` option instead.
   * TODO: We have a plan to remove this in a future major version.
   * @param node The AST node or token.
   * @param skip A number of tokens to skip.
   * @returns An object representing the token.
   * @deprecated
   */
  getTokenOrCommentAfter(node: HasLocation, skip?: number): Token$1 | null;
  /**
   * Gets the first `count` tokens of the given node.
   * @param node - The AST node.
   * @param [options=0] - The option object. If this is a number then it's `options.count`. If this is a function then it's `options.filter`.
   * @param [options.includeComments=false] - The flag to iterate comments as well.
   * @param [options.filter=null] - The predicate function to choose tokens.
   * @param [options.count=0] - The maximum count of tokens the cursor iterates.
   * @returns Tokens.
   */
  getFirstTokens(node: HasLocation, options?: CountOptions): Token$1[];
  /**
   * Gets the last `count` tokens of the given node.
   * @param node - The AST node.
   * @param [options=0] - The option object. Same options as getFirstTokens()
   * @returns Tokens.
   */
  getLastTokens(node: HasLocation, options?: CountOptions): Token$1[];
  /**
   * Gets the `count` tokens that precedes a given node or token.
   * @param node - The AST node or token.
   * @param [options=0] - The option object. Same options as getFirstTokens()
   * @returns Tokens.
   */
  getTokensBefore(node: HasLocation, options?: CountOptions): Token$1[];
  /**
   * Gets the `count` tokens that follows a given node or token.
   * @param node - The AST node or token.
   * @param [options=0] - The option object. Same options as getFirstTokens()
   * @returns Tokens.
   */
  getTokensAfter(node: HasLocation, options?: CountOptions): Token$1[];
  /**
   * Gets the first `count` tokens between two non-overlapping nodes.
   * @param left - Node before the desired token range.
   * @param right - Node after the desired token range.
   * @param [options=0] - The option object. Same options as getFirstTokens()
   * @returns Tokens between left and right.
   */
  getFirstTokensBetween(left: HasLocation, right: HasLocation, options?: CountOptions): Token$1[];
  /**
   * Gets the last `count` tokens between two non-overlapping nodes.
   * @param left Node before the desired token range.
   * @param right Node after the desired token range.
   * @param [options=0] - The option object. Same options as getFirstTokens()
   * @returns Tokens between left and right.
   */
  getLastTokensBetween(left: HasLocation, right: HasLocation, options?: CountOptions): Token$1[];
  /**
   * Gets all tokens that are related to the given node.
   * @param node - The AST node.
   * @param beforeCount - The number of tokens before the node to retrieve.
   * @param afterCount - The number of tokens after the node to retrieve.
   * @returns Array of objects representing tokens.
   */
  getTokens(node: HasLocation, beforeCount?: CountOptions, afterCount?: number): Token$1[];
  /**
   * Gets all of the tokens between two non-overlapping nodes.
   * @param left Node before the desired token range.
   * @param right Node after the desired token range.
   * @param padding Number of extra tokens on either side of center.
   * @returns Tokens between left and right.
   */
  getTokensBetween(left: HasLocation, right: HasLocation, padding?: CountOptions): Token$1[];
  /**
   * Checks whether any comments exist or not between the given 2 nodes.
   *
   * @param left - The node to check.
   * @param right - The node to check.
   * @returns `true` if one or more comments exist.
   */
  commentsExistBetween(left: HasLocation, right: HasLocation): boolean;
  /**
   * Gets all comment tokens directly before the given node or token.
   * @param nodeOrToken The AST node or token to check for adjacent comment tokens.
   * @returns An array of comments in occurrence order.
   */
  getCommentsBefore(nodeOrToken: HasLocation): Token$1[];
  /**
   * Gets all comment tokens directly after the given node or token.
   * @param nodeOrToken The AST node or token to check for adjacent comment tokens.
   * @returns An array of comments in occurrence order.
   */
  getCommentsAfter(nodeOrToken: HasLocation): Token$1[];
  /**
   * Gets all comment tokens inside the given node.
   * @param node The AST node to get the comments for.
   * @returns An array of comments in occurrence order.
   */
  getCommentsInside(node: HasLocation): Token$1[];
  /**
   * Returns the location of the given node or token.
   * @param nodeOrToken The node or token to get the location of.
   * @returns The location of the node or token.
   */
  getLoc(nodeOrToken: HasLocation): LocationRange;
  /**
   * Returns the range of the given node or token.
   * @param nodeOrToken The node or token to get the range of.
   * @returns The range of the node or token.
   */
  getRange(nodeOrToken: HasLocation): OffsetRange;
}
//#endregion
//#region src/common/parser-object.d.ts
/**
 * The type of basic ESLint custom parser.
 * e.g. espree
 */
type BasicParserObject<R = ESLintProgram> = {
  parse(code: string, options: any): R;
  parseForESLint: undefined;
};
/**
 * The type of ESLint custom parser enhanced for ESLint.
 * e.g. @babel/eslint-parser, @typescript-eslint/parser
 */
type EnhancedParserObject<R = ESLintExtendedProgram> = {
  parseForESLint(code: string, options: any): R;
  parse: undefined;
};
/**
 * The type of ESLint (custom) parsers.
 */
type ParserObject<R1 = ESLintExtendedProgram, R2 = ESLintProgram> = EnhancedParserObject<R1> | BasicParserObject<R2>;
//#endregion
//#region src/sfc/custom-block/index.d.ts
type ESLintCustomBlockParser = ParserObject<any, any>;
type CustomBlockContext = {
  getSourceCode(): SourceCode;
  sourceCode: SourceCode;
  parserServices: any;
  getAncestors(): any[];
  getDeclaredVariables(node: any): any[];
  getScope(): any;
  markVariableAsUsed(name: string): boolean;
  id: string;
  options: any[];
  settings: {
    [name: string]: any;
  };
  parserPath: string;
  parserOptions: any;
  getFilename(): string;
  report(descriptor: Rule.ReportDescriptor): void;
};
//#endregion
//#region src/parser-services.d.ts
type CustomBlockVisitorFactory = (context: CustomBlockContext) => {
  [key: string]: (...args: any) => void;
} | null | undefined;
interface ParserServices {
  /**
   * Define handlers to traverse the template body.
   * @param templateBodyVisitor The template body handlers.
   * @param scriptVisitor The script handlers. This is optional.
   * @param options The options. This is optional.
   */
  defineTemplateBodyVisitor(templateBodyVisitor: {
    [key: string]: (...args: any) => void;
  }, scriptVisitor?: {
    [key: string]: (...args: any) => void;
  }, options?: {
    templateBodyTriggerSelector: "Program" | "Program:exit";
  }): object;
  /**
   * Define handlers to traverse the document.
   * @param documentVisitor The document handlers.
   * @param options The options. This is optional.
   */
  defineDocumentVisitor(documentVisitor: {
    [key: string]: (...args: any) => void;
  }, options?: {
    triggerSelector: "Program" | "Program:exit";
  }): object;
  /**
   * Define handlers to traverse custom blocks.
   * @param context The rule context.
   * @param parser The custom parser.
   * @param rule The custom block rule definition
   * @param scriptVisitor The script handlers. This is optional.
   */
  defineCustomBlocksVisitor(context: Rule.RuleContext, parser: ESLintCustomBlockParser, rule: {
    target: string | string[] | ((lang: string | null, customBlock: VElement) => boolean);
    create: CustomBlockVisitorFactory;
  }, scriptVisitor?: {
    [key: string]: (...args: any) => void;
  }): {
    [key: string]: (...args: any) => void;
  };
  /**
   * Get the token store of the template body.
   * @returns The token store of template body.
   */
  getTemplateBodyTokenStore(): TokenStore;
  /**
   * Get the root document fragment.
   * @returns The root document fragment.
   */
  getDocumentFragment(): VDocumentFragment | null;
}
//#endregion
//#region src/ast/nodes.d.ts
/**
 * Objects which have their parent.
 */
interface HasParent {
  parent?: Node | null;
}
/**
 * The union type for all nodes.
 */
type Node = ESLintNode | VNode | VForExpression | VOnExpression | VSlotScopeExpression | VGenericExpression | VFilterSequenceExpression | VFilter;
/**
 * The union type for ESLint nodes.
 */
type ESLintNode = ESLintIdentifier | ESLintLiteral | ESLintProgram | ESLintSwitchCase | ESLintCatchClause | ESLintVariableDeclarator | ESLintStatement | ESLintExpression | ESLintProperty | ESLintAssignmentProperty | ESLintSuper | ESLintTemplateElement | ESLintSpreadElement | ESLintPattern | ESLintClassBody | ESLintMethodDefinition | ESLintPropertyDefinition | ESLintStaticBlock | ESLintPrivateIdentifier | ESLintModuleDeclaration | ESLintModuleSpecifier | ESLintImportExpression | ESLintLegacyRestProperty;
/**
 * The parsing result of ESLint custom parsers.
 */
interface ESLintExtendedProgram {
  ast: ESLintProgram;
  services?: ParserServices;
  visitorKeys?: {
    [type: string]: string[];
  };
  scopeManager?: ScopeManager;
}
interface ESLintProgram extends HasLocation, HasParent {
  type: "Program";
  sourceType: "script" | "module";
  body: (ESLintStatement | ESLintModuleDeclaration)[];
  templateBody?: VElement & HasConcreteInfo;
  tokens?: Token$1[];
  comments?: Token$1[];
  errors?: ParseError[];
}
type ESLintStatement = ESLintExpressionStatement | ESLintBlockStatement | ESLintEmptyStatement | ESLintDebuggerStatement | ESLintWithStatement | ESLintReturnStatement | ESLintLabeledStatement | ESLintBreakStatement | ESLintContinueStatement | ESLintIfStatement | ESLintSwitchStatement | ESLintThrowStatement | ESLintTryStatement | ESLintWhileStatement | ESLintDoWhileStatement | ESLintForStatement | ESLintForInStatement | ESLintForOfStatement | ESLintDeclaration;
interface ESLintEmptyStatement extends HasLocation, HasParent {
  type: "EmptyStatement";
}
interface ESLintBlockStatement extends HasLocation, HasParent {
  type: "BlockStatement";
  body: ESLintStatement[];
}
interface ESLintExpressionStatement extends HasLocation, HasParent {
  type: "ExpressionStatement";
  expression: ESLintExpression;
}
interface ESLintIfStatement extends HasLocation, HasParent {
  type: "IfStatement";
  test: ESLintExpression;
  consequent: ESLintStatement;
  alternate: ESLintStatement | null;
}
interface ESLintSwitchStatement extends HasLocation, HasParent {
  type: "SwitchStatement";
  discriminant: ESLintExpression;
  cases: ESLintSwitchCase[];
}
interface ESLintSwitchCase extends HasLocation, HasParent {
  type: "SwitchCase";
  test: ESLintExpression | null;
  consequent: ESLintStatement[];
}
interface ESLintWhileStatement extends HasLocation, HasParent {
  type: "WhileStatement";
  test: ESLintExpression;
  body: ESLintStatement;
}
interface ESLintDoWhileStatement extends HasLocation, HasParent {
  type: "DoWhileStatement";
  body: ESLintStatement;
  test: ESLintExpression;
}
interface ESLintForStatement extends HasLocation, HasParent {
  type: "ForStatement";
  init: ESLintVariableDeclaration | ESLintExpression | null;
  test: ESLintExpression | null;
  update: ESLintExpression | null;
  body: ESLintStatement;
}
interface ESLintForInStatement extends HasLocation, HasParent {
  type: "ForInStatement";
  left: ESLintVariableDeclaration | ESLintPattern;
  right: ESLintExpression;
  body: ESLintStatement;
}
interface ESLintForOfStatement extends HasLocation, HasParent {
  type: "ForOfStatement";
  left: ESLintVariableDeclaration | ESLintPattern;
  right: ESLintExpression;
  body: ESLintStatement;
  await: boolean;
}
interface ESLintLabeledStatement extends HasLocation, HasParent {
  type: "LabeledStatement";
  label: ESLintIdentifier;
  body: ESLintStatement;
}
interface ESLintBreakStatement extends HasLocation, HasParent {
  type: "BreakStatement";
  label: ESLintIdentifier | null;
}
interface ESLintContinueStatement extends HasLocation, HasParent {
  type: "ContinueStatement";
  label: ESLintIdentifier | null;
}
interface ESLintReturnStatement extends HasLocation, HasParent {
  type: "ReturnStatement";
  argument: ESLintExpression | null;
}
interface ESLintThrowStatement extends HasLocation, HasParent {
  type: "ThrowStatement";
  argument: ESLintExpression;
}
interface ESLintTryStatement extends HasLocation, HasParent {
  type: "TryStatement";
  block: ESLintBlockStatement;
  handler: ESLintCatchClause | null;
  finalizer: ESLintBlockStatement | null;
}
interface ESLintCatchClause extends HasLocation, HasParent {
  type: "CatchClause";
  param: ESLintPattern | null;
  body: ESLintBlockStatement;
}
interface ESLintWithStatement extends HasLocation, HasParent {
  type: "WithStatement";
  object: ESLintExpression;
  body: ESLintStatement;
}
interface ESLintDebuggerStatement extends HasLocation, HasParent {
  type: "DebuggerStatement";
}
type ESLintDeclaration = ESLintFunctionDeclaration | ESLintVariableDeclaration | ESLintClassDeclaration;
interface ESLintFunctionDeclaration extends HasLocation, HasParent {
  type: "FunctionDeclaration";
  async: boolean;
  generator: boolean;
  id: ESLintIdentifier | null;
  params: ESLintPattern[];
  body: ESLintBlockStatement;
}
interface ESLintVariableDeclaration extends HasLocation, HasParent {
  type: "VariableDeclaration";
  kind: "var" | "let" | "const";
  declarations: ESLintVariableDeclarator[];
}
interface ESLintVariableDeclarator extends HasLocation, HasParent {
  type: "VariableDeclarator";
  id: ESLintPattern;
  init: ESLintExpression | null;
}
interface ESLintClassDeclaration extends HasLocation, HasParent {
  type: "ClassDeclaration";
  id: ESLintIdentifier | null;
  superClass: ESLintExpression | null;
  body: ESLintClassBody;
}
interface ESLintClassBody extends HasLocation, HasParent {
  type: "ClassBody";
  body: (ESLintMethodDefinition | ESLintPropertyDefinition | ESLintStaticBlock)[];
}
interface ESLintMethodDefinition extends HasLocation, HasParent {
  type: "MethodDefinition";
  kind: "constructor" | "method" | "get" | "set";
  computed: boolean;
  static: boolean;
  key: ESLintExpression | ESLintPrivateIdentifier;
  value: ESLintFunctionExpression;
}
interface ESLintPropertyDefinition extends HasLocation, HasParent {
  type: "PropertyDefinition";
  computed: boolean;
  static: boolean;
  key: ESLintExpression | ESLintPrivateIdentifier;
  value: ESLintExpression | null;
}
interface ESLintStaticBlock extends HasLocation, HasParent, Omit<ESLintBlockStatement, "type"> {
  type: "StaticBlock";
  body: ESLintStatement[];
}
interface ESLintPrivateIdentifier extends HasLocation, HasParent {
  type: "PrivateIdentifier";
  name: string;
}
type ESLintModuleDeclaration = ESLintImportDeclaration | ESLintExportNamedDeclaration | ESLintExportDefaultDeclaration | ESLintExportAllDeclaration;
type ESLintModuleSpecifier = ESLintImportSpecifier | ESLintImportDefaultSpecifier | ESLintImportNamespaceSpecifier | ESLintExportSpecifier;
interface ESLintImportDeclaration extends HasLocation, HasParent {
  type: "ImportDeclaration";
  specifiers: (ESLintImportSpecifier | ESLintImportDefaultSpecifier | ESLintImportNamespaceSpecifier)[];
  source: ESLintLiteral;
}
interface ESLintImportSpecifier extends HasLocation, HasParent {
  type: "ImportSpecifier";
  imported: ESLintIdentifier | ESLintStringLiteral;
  local: ESLintIdentifier;
}
interface ESLintImportDefaultSpecifier extends HasLocation, HasParent {
  type: "ImportDefaultSpecifier";
  local: ESLintIdentifier;
}
interface ESLintImportNamespaceSpecifier extends HasLocation, HasParent {
  type: "ImportNamespaceSpecifier";
  local: ESLintIdentifier;
}
interface ESLintImportExpression extends HasLocation, HasParent {
  type: "ImportExpression";
  source: ESLintExpression;
}
interface ESLintExportNamedDeclaration extends HasLocation, HasParent {
  type: "ExportNamedDeclaration";
  declaration?: ESLintDeclaration | null;
  specifiers: ESLintExportSpecifier[];
  source?: ESLintLiteral | null;
}
interface ESLintExportSpecifier extends HasLocation, HasParent {
  type: "ExportSpecifier";
  local: ESLintIdentifier | ESLintStringLiteral;
  exported: ESLintIdentifier | ESLintStringLiteral;
}
interface ESLintExportDefaultDeclaration extends HasLocation, HasParent {
  type: "ExportDefaultDeclaration";
  declaration: ESLintDeclaration | ESLintExpression;
}
interface ESLintExportAllDeclaration extends HasLocation, HasParent {
  type: "ExportAllDeclaration";
  exported: ESLintIdentifier | ESLintStringLiteral | null;
  source: ESLintLiteral;
}
type ESLintExpression = ESLintThisExpression | ESLintArrayExpression | ESLintObjectExpression | ESLintFunctionExpression | ESLintArrowFunctionExpression | ESLintYieldExpression | ESLintLiteral | ESLintUnaryExpression | ESLintUpdateExpression | ESLintBinaryExpression | ESLintAssignmentExpression | ESLintLogicalExpression | ESLintMemberExpression | ESLintConditionalExpression | ESLintCallExpression | ESLintNewExpression | ESLintSequenceExpression | ESLintTemplateLiteral | ESLintTaggedTemplateExpression | ESLintClassExpression | ESLintMetaProperty | ESLintIdentifier | ESLintAwaitExpression | ESLintChainExpression;
interface ESLintIdentifier extends HasLocation, HasParent {
  type: "Identifier";
  name: string;
}
interface ESLintLiteralBase extends HasLocation, HasParent {
  type: "Literal";
  value: string | boolean | null | number | RegExp | bigint;
  raw: string;
  regex?: {
    pattern: string;
    flags: string;
  };
  bigint?: string;
}
interface ESLintStringLiteral extends ESLintLiteralBase {
  value: string;
  regex?: undefined;
  bigint?: undefined;
}
interface ESLintBooleanLiteral extends ESLintLiteralBase {
  value: boolean;
  regex?: undefined;
  bigint?: undefined;
}
interface ESLintNullLiteral extends ESLintLiteralBase {
  value: null;
  regex?: undefined;
  bigint?: undefined;
}
interface ESLintNumberLiteral extends ESLintLiteralBase {
  value: number;
  regex?: undefined;
  bigint?: undefined;
}
interface ESLintRegExpLiteral extends ESLintLiteralBase {
  value: null | RegExp;
  regex: {
    pattern: string;
    flags: string;
  };
  bigint?: undefined;
}
interface ESLintBigIntLiteral extends ESLintLiteralBase {
  value: null | bigint;
  regex?: undefined;
  bigint: string;
}
type ESLintLiteral = ESLintStringLiteral | ESLintBooleanLiteral | ESLintNullLiteral | ESLintNumberLiteral | ESLintRegExpLiteral | ESLintBigIntLiteral;
interface ESLintThisExpression extends HasLocation, HasParent {
  type: "ThisExpression";
}
interface ESLintArrayExpression extends HasLocation, HasParent {
  type: "ArrayExpression";
  elements: (ESLintExpression | ESLintSpreadElement)[];
}
interface ESLintObjectExpression extends HasLocation, HasParent {
  type: "ObjectExpression";
  properties: (ESLintProperty | ESLintSpreadElement | ESLintLegacySpreadProperty)[];
}
interface ESLintProperty extends HasLocation, HasParent {
  type: "Property";
  kind: "init" | "get" | "set";
  method: boolean;
  shorthand: boolean;
  computed: boolean;
  key: ESLintExpression;
  value: ESLintExpression | ESLintPattern;
}
interface ESLintFunctionExpression extends HasLocation, HasParent {
  type: "FunctionExpression";
  async: boolean;
  generator: boolean;
  id: ESLintIdentifier | null;
  params: ESLintPattern[];
  body: ESLintBlockStatement;
}
interface ESLintArrowFunctionExpression extends HasLocation, HasParent {
  type: "ArrowFunctionExpression";
  async: boolean;
  generator: boolean;
  id: ESLintIdentifier | null;
  params: ESLintPattern[];
  body: ESLintBlockStatement | ESLintExpression;
}
interface ESLintSequenceExpression extends HasLocation, HasParent {
  type: "SequenceExpression";
  expressions: ESLintExpression[];
}
interface ESLintUnaryExpression extends HasLocation, HasParent {
  type: "UnaryExpression";
  operator: "-" | "+" | "!" | "~" | "typeof" | "void" | "delete";
  prefix: boolean;
  argument: ESLintExpression;
}
interface ESLintBinaryExpression extends HasLocation, HasParent {
  type: "BinaryExpression";
  operator: "==" | "!=" | "===" | "!==" | "<" | "<=" | ">" | ">=" | "<<" | ">>" | ">>>" | "+" | "-" | "*" | "/" | "%" | "**" | "|" | "^" | "&" | "in" | "instanceof";
  left: ESLintExpression | ESLintPrivateIdentifier;
  right: ESLintExpression;
}
interface ESLintAssignmentExpression extends HasLocation, HasParent {
  type: "AssignmentExpression";
  operator: "=" | "+=" | "-=" | "*=" | "/=" | "%=" | "**=" | "<<=" | ">>=" | ">>>=" | "|=" | "^=" | "&=" | "||=" | "&&=" | "??=";
  left: ESLintPattern;
  right: ESLintExpression;
}
interface ESLintUpdateExpression extends HasLocation, HasParent {
  type: "UpdateExpression";
  operator: "++" | "--";
  argument: ESLintExpression;
  prefix: boolean;
}
interface ESLintLogicalExpression extends HasLocation, HasParent {
  type: "LogicalExpression";
  operator: "||" | "&&" | "??";
  left: ESLintExpression;
  right: ESLintExpression;
}
interface ESLintConditionalExpression extends HasLocation, HasParent {
  type: "ConditionalExpression";
  test: ESLintExpression;
  alternate: ESLintExpression;
  consequent: ESLintExpression;
}
interface ESLintCallExpression extends HasLocation, HasParent {
  type: "CallExpression";
  optional: boolean;
  callee: ESLintExpression | ESLintSuper;
  arguments: (ESLintExpression | ESLintSpreadElement)[];
}
interface ESLintSuper extends HasLocation, HasParent {
  type: "Super";
}
interface ESLintNewExpression extends HasLocation, HasParent {
  type: "NewExpression";
  callee: ESLintExpression;
  arguments: (ESLintExpression | ESLintSpreadElement)[];
}
interface ESLintMemberExpression extends HasLocation, HasParent {
  type: "MemberExpression";
  optional: boolean;
  computed: boolean;
  object: ESLintExpression | ESLintSuper;
  property: ESLintExpression | ESLintPrivateIdentifier;
}
interface ESLintYieldExpression extends HasLocation, HasParent {
  type: "YieldExpression";
  delegate: boolean;
  argument: ESLintExpression | null;
}
interface ESLintAwaitExpression extends HasLocation, HasParent {
  type: "AwaitExpression";
  argument: ESLintExpression;
}
interface ESLintTemplateLiteral extends HasLocation, HasParent {
  type: "TemplateLiteral";
  quasis: ESLintTemplateElement[];
  expressions: ESLintExpression[];
}
interface ESLintTaggedTemplateExpression extends HasLocation, HasParent {
  type: "TaggedTemplateExpression";
  tag: ESLintExpression;
  quasi: ESLintTemplateLiteral;
}
interface ESLintTemplateElement extends HasLocation, HasParent {
  type: "TemplateElement";
  tail: boolean;
  value: {
    cooked: string | null;
    raw: string;
  };
}
interface ESLintClassExpression extends HasLocation, HasParent {
  type: "ClassExpression";
  id: ESLintIdentifier | null;
  superClass: ESLintExpression | null;
  body: ESLintClassBody;
}
interface ESLintMetaProperty extends HasLocation, HasParent {
  type: "MetaProperty";
  meta: ESLintIdentifier;
  property: ESLintIdentifier;
}
type ESLintPattern = ESLintIdentifier | ESLintObjectPattern | ESLintArrayPattern | ESLintRestElement | ESLintAssignmentPattern | ESLintMemberExpression | ESLintLegacyRestProperty;
interface ESLintObjectPattern extends HasLocation, HasParent {
  type: "ObjectPattern";
  properties: (ESLintAssignmentProperty | ESLintRestElement | ESLintLegacyRestProperty)[];
}
interface ESLintAssignmentProperty extends ESLintProperty {
  value: ESLintPattern;
  kind: "init";
  method: false;
}
interface ESLintArrayPattern extends HasLocation, HasParent {
  type: "ArrayPattern";
  elements: ESLintPattern[];
}
interface ESLintRestElement extends HasLocation, HasParent {
  type: "RestElement";
  argument: ESLintPattern;
}
interface ESLintSpreadElement extends HasLocation, HasParent {
  type: "SpreadElement";
  argument: ESLintExpression;
}
interface ESLintAssignmentPattern extends HasLocation, HasParent {
  type: "AssignmentPattern";
  left: ESLintPattern;
  right: ESLintExpression;
}
type ESLintChainElement = ESLintCallExpression | ESLintMemberExpression;
interface ESLintChainExpression extends HasLocation, HasParent {
  type: "ChainExpression";
  expression: ESLintChainElement;
}
/**
 * Legacy for babel-eslint and espree.
 */
interface ESLintLegacyRestProperty extends HasLocation, HasParent {
  type: "RestProperty" | "ExperimentalRestProperty";
  argument: ESLintPattern;
}
/**
 * Legacy for babel-eslint and espree.
 */
interface ESLintLegacySpreadProperty extends HasLocation, HasParent {
  type: "SpreadProperty" | "ExperimentalSpreadProperty";
  argument: ESLintExpression;
}
/**
 * Constants of namespaces.
 * @see https://infra.spec.whatwg.org/#namespaces
 */
declare const NS: Readonly<{
  HTML: "http://www.w3.org/1999/xhtml";
  MathML: "http://www.w3.org/1998/Math/MathML";
  SVG: "http://www.w3.org/2000/svg";
  XLink: "http://www.w3.org/1999/xlink";
  XML: "http://www.w3.org/XML/1998/namespace";
  XMLNS: "http://www.w3.org/2000/xmlns/";
}>;
/**
 * Type of namespaces.
 */
type Namespace = typeof NS.HTML | typeof NS.MathML | typeof NS.SVG | typeof NS.XLink | typeof NS.XML | typeof NS.XMLNS;
/**
 * Type of variable definitions.
 */
interface Variable {
  id: ESLintIdentifier;
  kind: "v-for" | "scope" | "generic";
  references: Reference[];
}
/**
 * Type of variable references.
 */
interface Reference {
  id: ESLintIdentifier;
  mode: "rw" | "r" | "w";
  variable: Variable | null;
  isValueReference?: boolean;
  isTypeReference?: boolean;
}
/**
 * The node of `v-for` directives.
 */
interface VForExpression extends HasLocation, HasParent {
  type: "VForExpression";
  parent: VExpressionContainer;
  left: ESLintPattern[];
  right: ESLintExpression;
}
/**
 * The node of `v-on` directives.
 */
interface VOnExpression extends HasLocation, HasParent {
  type: "VOnExpression";
  parent: VExpressionContainer;
  body: ESLintStatement[];
}
/**
 * The node of `slot-scope` directives.
 */
interface VSlotScopeExpression extends HasLocation, HasParent {
  type: "VSlotScopeExpression";
  parent: VExpressionContainer;
  params: ESLintPattern[];
}
/**
 * The node of `generic` directives.
 */
interface VGenericExpression extends HasLocation, HasParent {
  type: "VGenericExpression";
  parent: VExpressionContainer;
  params: TSTypeParameterDeclaration["params"];
  rawParams: string[];
}
/**
 * The node of a filter sequence which is separated by `|`.
 */
interface VFilterSequenceExpression extends HasLocation, HasParent {
  type: "VFilterSequenceExpression";
  parent: VExpressionContainer;
  expression: ESLintExpression;
  filters: VFilter[];
}
/**
 * The node of a filter sequence which is separated by `|`.
 */
interface VFilter extends HasLocation, HasParent {
  type: "VFilter";
  parent: VFilterSequenceExpression;
  callee: ESLintIdentifier;
  arguments: (ESLintExpression | ESLintSpreadElement)[];
}
/**
 * The union type of any nodes.
 */
type VNode = VAttribute | VDirective | VDirectiveKey | VDocumentFragment | VElement | VEndTag | VExpressionContainer | VIdentifier | VLiteral | VStartTag | VText;
/**
 * Text nodes.
 */
interface VText extends HasLocation, HasParent {
  type: "VText";
  parent: VDocumentFragment | VElement;
  value: string;
}
/**
 * The node of JavaScript expression in text.
 * e.g. `{{ name }}`
 */
interface VExpressionContainer extends HasLocation, HasParent {
  type: "VExpressionContainer";
  parent: VDocumentFragment | VElement | VDirective | VDirectiveKey;
  expression: ESLintExpression | VFilterSequenceExpression | VForExpression | VOnExpression | VSlotScopeExpression | VGenericExpression | null;
  references: Reference[];
}
/**
 * Attribute name nodes.
 */
interface VIdentifier extends HasLocation, HasParent {
  type: "VIdentifier";
  parent: VAttribute | VDirectiveKey;
  name: string;
  rawName: string;
}
/**
 * Attribute name nodes.
 */
interface VDirectiveKey extends HasLocation, HasParent {
  type: "VDirectiveKey";
  parent: VDirective;
  name: VIdentifier;
  argument: VExpressionContainer | VIdentifier | null;
  modifiers: VIdentifier[];
}
/**
 * Attribute value nodes.
 */
interface VLiteral extends HasLocation, HasParent {
  type: "VLiteral";
  parent: VAttribute;
  value: string;
}
/**
 * Static attribute nodes.
 */
interface VAttribute extends HasLocation, HasParent {
  type: "VAttribute";
  parent: VStartTag;
  directive: false;
  key: VIdentifier;
  value: VLiteral | null;
}
/**
 * Directive nodes.
 */
interface VDirective extends HasLocation, HasParent {
  type: "VAttribute";
  parent: VStartTag;
  directive: true;
  key: VDirectiveKey;
  value: VExpressionContainer | null;
}
/**
 * Start tag nodes.
 */
interface VStartTag extends HasLocation, HasParent {
  type: "VStartTag";
  parent: VElement;
  selfClosing: boolean;
  attributes: (VAttribute | VDirective)[];
}
/**
 * End tag nodes.
 */
interface VEndTag extends HasLocation, HasParent {
  type: "VEndTag";
  parent: VElement;
}
/**
 * The property which has concrete information.
 */
interface HasConcreteInfo {
  tokens: Token$1[];
  comments: Token$1[];
  errors: ParseError[];
}
/**
 * Element nodes.
 */
interface VElement extends HasLocation, HasParent {
  type: "VElement";
  parent: VDocumentFragment | VElement;
  namespace: Namespace;
  name: string;
  rawName: string;
  startTag: VStartTag;
  children: (VElement | VText | VExpressionContainer)[];
  endTag: VEndTag | null;
  variables: Variable[];
}
/**
 * Root nodes.
 */
interface VDocumentFragment extends HasLocation, HasParent, HasConcreteInfo {
  type: "VDocumentFragment";
  parent: null;
  children: (VElement | VText | VExpressionContainer | VStyleElement)[];
}
/**
 * Style element nodes.
 */
interface VStyleElement extends VElement {
  type: "VElement";
  name: "style";
  style: true;
  children: (VText | VExpressionContainer)[];
}
//#endregion
//#region src/ast/traverse.d.ts
declare const KEYS: Readonly<{
  [type: string]: readonly string[] | undefined;
}>;
/**
 * Get the keys of the given node to traverse it.
 * @param node The node to get.
 * @returns The keys to traverse.
 */
declare function getFallbackKeys(node: Node): string[];
interface Visitor {
  visitorKeys?: VisitorKeys$1;
  enterNode(node: Node, parent: Node | null): void;
  leaveNode(node: Node, parent: Node | null): void;
}
/**
 * Traverse the given AST tree.
 * @param node Root node to traverse.
 * @param visitor Visitor.
 */
declare function traverseNodes(node: Node, visitor: Visitor): void;
declare namespace index_d_exports {
  export { ESLintArrayExpression, ESLintArrayPattern, ESLintArrowFunctionExpression, ESLintAssignmentExpression, ESLintAssignmentPattern, ESLintAssignmentProperty, ESLintAwaitExpression, ESLintBigIntLiteral, ESLintBinaryExpression, ESLintBlockStatement, ESLintBooleanLiteral, ESLintBreakStatement, ESLintCallExpression, ESLintCatchClause, ESLintChainElement, ESLintChainExpression, ESLintClassBody, ESLintClassDeclaration, ESLintClassExpression, ESLintConditionalExpression, ESLintContinueStatement, ESLintDebuggerStatement, ESLintDeclaration, ESLintDoWhileStatement, ESLintEmptyStatement, ESLintExportAllDeclaration, ESLintExportDefaultDeclaration, ESLintExportNamedDeclaration, ESLintExportSpecifier, ESLintExpression, ESLintExpressionStatement, ESLintExtendedProgram, ESLintForInStatement, ESLintForOfStatement, ESLintForStatement, ESLintFunctionDeclaration, ESLintFunctionExpression, ESLintIdentifier, ESLintIfStatement, ESLintImportDeclaration, ESLintImportDefaultSpecifier, ESLintImportExpression, ESLintImportNamespaceSpecifier, ESLintImportSpecifier, ESLintLabeledStatement, ESLintLegacyRestProperty, ESLintLegacySpreadProperty, ESLintLiteral, ESLintLogicalExpression, ESLintMemberExpression, ESLintMetaProperty, ESLintMethodDefinition, ESLintModuleDeclaration, ESLintModuleSpecifier, ESLintNewExpression, ESLintNode, ESLintNullLiteral, ESLintNumberLiteral, ESLintObjectExpression, ESLintObjectPattern, ESLintPattern, ESLintPrivateIdentifier, ESLintProgram, ESLintProperty, ESLintPropertyDefinition, ESLintRegExpLiteral, ESLintRestElement, ESLintReturnStatement, ESLintSequenceExpression, ESLintSpreadElement, ESLintStatement, ESLintStaticBlock, ESLintStringLiteral, ESLintSuper, ESLintSwitchCase, ESLintSwitchStatement, ESLintTaggedTemplateExpression, ESLintTemplateElement, ESLintTemplateLiteral, ESLintThisExpression, ESLintThrowStatement, ESLintTryStatement, ESLintUnaryExpression, ESLintUpdateExpression, ESLintVariableDeclaration, ESLintVariableDeclarator, ESLintWhileStatement, ESLintWithStatement, ESLintYieldExpression, ErrorCode, HasConcreteInfo, HasLocation, HasParent, KEYS, Location, LocationRange, NS, Namespace, Node, Offset, OffsetRange, ParseError, Reference, Token$1 as Token, VAttribute, VDirective, VDirectiveKey, VDocumentFragment, VElement, VEndTag, VExpressionContainer, VFilter, VFilterSequenceExpression, VForExpression, VGenericExpression, VIdentifier, VLiteral, VNode, VOnExpression, VSlotScopeExpression, VStartTag, VStyleElement, VText, Variable, Visitor, getFallbackKeys, traverseNodes };
}
//#endregion
//#region src/index.d.ts
/**
 * Parse the given source code.
 * @param code The source code to parse.
 * @param parserOptions The parser options.
 * @returns The parsing result.
 */
declare function parseForESLint(code: string, parserOptions: any): ESLintExtendedProgram;
/**
 * Parse the given source code.
 * @param code The source code to parse.
 * @param options The parser options.
 * @returns The parsing result.
 */
declare function parse(code: string, options?: any): ESLintProgram;
declare const meta$1: {
  name: string;
  version: string;
};
//#endregion
export { type index_d_exports as AST, meta$1 as meta, parse, parseForESLint };
//# sourceMappingURL=index.d.cts.map