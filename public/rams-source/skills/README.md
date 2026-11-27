# RAMS skills for coding agents

Add the skills you want to each application that uses RAMS. They work with the component code and design rules already in the application. A site visitor can read the instructions, and installing RAMS components uses its own command.

## Install in your application

1. Clone or update the [RAMS GitHub repository](https://github.com/heypablozarate/rams).
2. From the checkout, copy a skill folder from `public/rams-source/skills/` to the application's `.agents/skills/` directory. Each folder contains a `SKILL.md`. Review any existing folder with the same name before replacing it.
3. Open the application in Codex. Type the skill's name with a dollar sign and name the part of the interface you want to work on.

Example from the RAMS checkout, for an application at `/path/to/app`:

```sh
mkdir -p /path/to/app/.agents/skills
test ! -e /path/to/app/.agents/skills/rams-interface-review &&
  cp -R public/rams-source/skills/rams-interface-review /path/to/app/.agents/skills/
```

Then use `$rams-interface-review review the action hierarchy on my settings screen`. Codex can also select an installed skill when its description matches the task. With another coding agent, open the skill file and ask it to follow the instructions using the application's files. Browser verification requires a browser tool or a way to run the project's tests.

## Choose a skill

| Skill | Use it to |
| --- | --- |
| [rams-interface-review](rams-interface-review/SKILL.md) | Compare action hierarchy, controls, and interface copy in a real view. |
| [rams-preview-stress-test](rams-preview-stress-test/SKILL.md) | Test reachable edge cases, reflow, focus, and recovery. |
| [rams-motion-review](rams-motion-review/SKILL.md) | Decide whether a transition helps and coordinate its parts. |
| [rams-prototype](rams-prototype/SKILL.md) | Compare design alternatives against the same task and states. |
| [rams-touch-interaction](rams-touch-interaction/SKILL.md) | Check gestures, native scrolling, and mobile viewport behavior. |
| [rams-motion-performance](rams-motion-performance/SKILL.md) | Diagnose a slow response or dropped frames in the consuming application. |
| [rams-learn-criteria](rams-learn-criteria/SKILL.md) | Turn a specific design correction into a scoped project rule. |

RAMS adaptations draw on [Emil Kowalski's skills](https://github.com/emilkowalski/skills), [Jakub Krehel's interface review](https://github.com/jakubkrehel/skills), and [Impeccable](https://github.com/pbakaus/impeccable). Use the components, tokens, and design authority of the application you are working in.
