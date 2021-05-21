// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Select } = require('enquirer');

import * as Rx from 'rxjs';

export class SoCPrompter {

  protected subject: Rx.Subject<number>;
  constructor({ socsSubject }: { socsSubject: Rx.Subject<number> }) {
    this.subject = socsSubject;
  }

  public async startPrompting(): Promise<void> {
    while (true) {
      // eslint-disable-next-line no-await-in-loop
      const soc = await promptSoC();

      if (soc) {
        this.subject.next(soc);
      } else {
        break;
      }
    }
  }

}

async function promptSoC(): Promise<number> {
  const socPrompt = new Select({
    name: 'soc',
    message: 'Pick a State of Charge',
    format: (option: string) => `${option}%`,
    result: (option: string) => parseInt(option, 10),
    choices: ['5', '10', '40', '80', '100']
  });

  try {
    return await socPrompt.run();
  } catch (error) {
    process.exit();
  }
}

export function createSoCPrompter({
  socsSubject
}: {
  socsSubject: Rx.Subject<number>;
}): SoCPrompter {
  return new SoCPrompter({ socsSubject });
}
