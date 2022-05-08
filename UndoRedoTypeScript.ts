//#region TYPINGS
type EmployeeID = number;

interface Employee {
    uniqueId: EmployeeID;
    name: string;
    subordinates: Array<EmployeeID>;
}

interface IEmployeeOrgApp {
    move(employeeID: EmployeeID, supervisorID: EmployeeID): void;
    undo(): void;
    redo(): void;
}

type MoveState = {
    employee: Employee;
    employeeSubordinateList: Array<EmployeeID>;
    oldSupervisor: Employee;
    newSupervisor: Employee;
    execute: () => void;
    invert: () => void;
};

type MoveHistory = Array<MoveState>;
//#endregion TYPINGS END

//#region SAMPLE EMPLOYEE DECLARATIONS
const ceo: Employee = {
    uniqueId: 1,
    name: 'Mark Zuckerberg',
    subordinates: [2, 3, 4, 5],
};

const employeeData: Array<Employee> = [
    {
        uniqueId: 2,
        name: 'Sarah Donald',
        subordinates: [6],
    },
    {
        uniqueId: 3,
        name: 'Tyler Simpson',
        subordinates: [7, 8, 9],
    },
    {
        uniqueId: 4,
        name: 'Bruce Willis',
        subordinates: [],
    },
    {
        uniqueId: 5,
        name: 'Georgina Flangy',
        subordinates: [10],
    },
    {
        uniqueId: 6,
        name: 'Cassandra Reynolds',
        subordinates: [11, 12],
    },
    {
        uniqueId: 7,
        name: 'Harry Tobs',
        subordinates: [13],
    },
    {
        uniqueId: 8,
        name: 'George Carrey',
        subordinates: [],
    },
    {
        uniqueId: 9,
        name: 'Gary Styles',
        subordinates: [],
    },
    {
        uniqueId: 10,
        name: 'Sophie Turner',
        subordinates: [],
    },
    {
        uniqueId: 11,
        name: 'Mary Blue',
        subordinates: [],
    },
    {
        uniqueId: 12,
        name: 'Bob Saget',
        subordinates: [14],
    },
    {
        uniqueId: 13,
        name: 'Thomas Brown',
        subordinates: [],
    },
    {
        uniqueId: 14,
        name: 'Tina Teff',
        subordinates: [15],
    },
    {
        uniqueId: 15,
        name: 'Will Turner',
        subordinates: [],
    },
];
//#endregion SAMPLE EMPLOYEE DECLARATIONS

//#region EmployeeOrgApp Class
class EmployeeOrgApp implements IEmployeeOrgApp {
    employeeList: Array<Employee> = [];
    private position: number = 0;
    private history: MoveHistory = [
        {
            employee: {} as Employee,
            employeeSubordinateList: [],
            oldSupervisor: {} as Employee,
            newSupervisor: {} as Employee,
            execute: () => {},
            invert: () => {},
        },
    ];

    constructor(ceo: Employee) {
        this.employeeList = [ceo, ...employeeData];
    }

    private getEmployee(employeeID: EmployeeID): Employee {
        return this.employeeList.find(
            (employee) => employee.uniqueId === employeeID
        )!;
    }

    private getSupervisor(employeeID: EmployeeID): Employee {
        return this.employeeList.find((employee) =>
            employee.subordinates.includes(employeeID)
        )!;
    }

    private addToSubordinateList(
        supervisor: Employee,
        subordinateList: Array<EmployeeID>
    ): void {
        supervisor.subordinates.push(...subordinateList);
    }

    private removeFromSubordinateList(
        supervisor: Employee,
        subordinateList: Array<EmployeeID>
    ): void {
        supervisor.subordinates = supervisor.subordinates.filter(
            (employeeID) => !subordinateList.includes(employeeID)
        );
    }

    public move(employeeID: EmployeeID, supervisorID: EmployeeID): void {
        if (this.position < this.history.length - 1) {
            this.history = this.history.slice(0, this.position + 1);
        }

        const currentState: MoveState = {
            employee: this.getEmployee(employeeID),
            employeeSubordinateList: this.getEmployee(employeeID).subordinates,
            oldSupervisor: this.getSupervisor(employeeID),
            newSupervisor: this.getEmployee(supervisorID),
            execute: () => {
                this.addToSubordinateList(
                    currentState.oldSupervisor,
                    currentState.employee.subordinates
                );

                this.removeFromSubordinateList(
                    currentState.employee,
                    currentState.employee.subordinates
                );

                this.removeFromSubordinateList(currentState.oldSupervisor, [
                    employeeID,
                ]);

                this.addToSubordinateList(currentState.newSupervisor, [
                    employeeID,
                ]);
            },
            invert: () => {
                this.removeFromSubordinateList(currentState.newSupervisor, [
                    employeeID,
                ]);

                this.addToSubordinateList(currentState.oldSupervisor, [
                    employeeID,
                ]);

                this.removeFromSubordinateList(
                    currentState.oldSupervisor,
                    currentState.employeeSubordinateList
                );

                this.addToSubordinateList(
                    currentState.employee,
                    currentState.employeeSubordinateList
                );
            },
        };

        this.history.push(currentState);
        this.position += 1;

        console.log('\n**BEFORE MOVE**\n');
        const oldSupervisorID = this.getSupervisor(employeeID).uniqueId;
        console.log(
            this.employeeList.filter((employee) =>
                [employeeID, oldSupervisorID, supervisorID].includes(
                    employee.uniqueId
                )
            )
        );

        currentState.execute();

        console.log('\n**AFTER MOVE**\n');
        console.log(
            this.employeeList.filter((employee) =>
                [employeeID, oldSupervisorID, supervisorID].includes(
                    employee.uniqueId
                )
            )
        );
    }

    public undo(): void {
        if (this.position > 0) {
            console.log('\n**BEFORE UNDO**\n');
            console.log(this.employeeList);

            this.history[this.position].invert();
            this.position -= 1;

            console.log('\n**AFTER UNDO**\n');
            console.log(this.employeeList);
        }
    }

    public redo(): void {
        if (this.position < this.history.length - 1) {
            console.log('\n**BEFORE REDO**\n');
            console.log(this.employeeList);

            this.position += 1;
            this.history[this.position].execute();

            console.log('\n**AFTER REDO**\n');
            console.log(this.employeeList);
        }
    }
}
//#endregion EmployeeOrgApp Class END

//#region Initialization and Execution
const employeeOrgApp = new EmployeeOrgApp(ceo);
employeeOrgApp.move(3, 7);
employeeOrgApp.undo();
employeeOrgApp.redo();
//#endregion Initialization and Execution END
