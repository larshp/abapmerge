export default class Class {

  private name: String;
  private definition: String;
  private implementation: String;
  private dependencies: String[];

  public constructor(name: String, definition: String, implementation?: string, dependencies?: String[]) {
    this.name = name;
    this.definition = definition;
    this.implementation = implementation;
    this.dependencies = dependencies;
  }

  public getName(): String {
    return this.name;
  }

  public getDefinition(): String {
    return this.definition;
  }

  public getImplementation(): String {
    return this.implementation;
  }

  public getDependencies(): String[] {
    return this.dependencies;
  }

}
