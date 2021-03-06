import Checkbox from "../checkbox/checkbox";
import Task from "../task/task";

export default class Pin extends HTMLElement {
    private task: Task;
    private checkbox: Checkbox;
    private tasktext: HTMLSpanElement;

    constructor(task: Task) {
        super();

        this.task = task;

        const template: HTMLTemplateElement = document.querySelector("#task") as HTMLTemplateElement;
        const node: DocumentFragment = document.importNode(template.content, true);
        this.appendChild(node);

        this.id = `pinned-${task.id}`;

        this.checkbox = new Checkbox(this.id);

        this.tasktext = document.createElement("span");
        this.tasktext.innerText = task.textElement.innerText;
        this.tasktext.setAttribute("contenteditable", "true");

        const header: HTMLElement = this.querySelector("header") as HTMLElement;
        header.appendChild(this.checkbox);
        header.appendChild(this.tasktext);

        (this.querySelector("header > a:nth-child(2)") as HTMLElement).addEventListener("click", this.onLinkClick);

        this.tasktext.addEventListener("keypress", this.onKeyPress);
        this.tasktext.addEventListener("keyup", this.onKeyUp);
        this.checkbox.addEventListener("change", this.onStatusChange);
    }

    public updateLocation(): void {
        const footer: HTMLElement = this.querySelector("footer") as HTMLElement;

        while (footer.hasChildNodes()) {
            footer.removeChild(footer.lastChild as Node);
        }

        const s: string[] = [];

        for (let p: Task|null = this.task.parent() ; p && p.id !== "root" ; p = p.parent()) {
            s.push(p.textElement.innerText);
        }

        for (const x of s.reverse()) {
            const item: HTMLDivElement = document.createElement("div");
            item.innerHTML = x;
            footer.appendChild(item);
        }
    }

    public connectedCallback(): void {
        if (this.task.isConnected) {
            this.updateLocation();
        }
    }

    private onLinkClick = async (e: Event): Promise<void> => {
        e.preventDefault();
        await this.task.togglePinned();
        this.remove();
    }

    private onKeyPress = async (e: KeyboardEvent): Promise<void> => {
        if (e.shiftKey) {
            switch (e.keyCode) {
            case 9: // tab
            case 38: // ArrowUp
            case 40: // ArrowDown
                e.preventDefault();
                return;
            }
        }

        if (e.ctrlKey) {
            switch (e.keyCode) {
            case 8: // backspace
            case 13: // enter
            case 38: // ArrowUp
            case 40: // ArrowDown
                e.preventDefault();
                return;
            }
        }

        switch (e.keyCode) {
        case 9: // tab
        case 13: // enter
        case 38: // ArrowUp
        case 40: // ArrowDown
            e.preventDefault();
            return;
        }
    }

    private onKeyUp = async (): Promise<void> => {
        await this.task.updateText(this.tasktext.innerText);
    }

    private onStatusChange = async (): Promise<void> => {
        await Promise.all([
            this.task.toggleChecked(),
        ]);

        this.remove();
    }
}

window.customElements.define("x-pin", Pin);
