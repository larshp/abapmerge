export default class Class {

  private name: string;
  private definition: string;
  private implementation: string;
  private forTesting: boolean;
  private dependencies: string[];

  public constructor(name: string, definition: string, forTesting: boolean, implementation?: string, dependencies?: string[]) {
    this.name = name;
    this.definition = definition;
    this.implementation = implementation;
    this.dependencies = dependencies;
    this.forTesting = forTesting;
  }

  public getName(): string {
    return this.name;
  }

  public getDefinition(): string {
    return this.definition;
  }

  public getImplementation(): string {
    return this.implementation;
  }

  public getDependencies(): string[] {
    return this.dependencies;
  }

  public isForTesting(): boolean {
    return this.forTesting;
  }

}
