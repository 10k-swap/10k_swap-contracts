# Develop

## Tools

IDE: Visual Studio Code

Plugin: [`Cairo`](https://marketplace.visualstudio.com/items?itemname=starkware.cairo)

Environment: `python3` `gmp` `cairo-lang`

## Install cairo env

- We recommend working inside a python virtual environment, but you can also install the Cairo package directly. To create and enter the virtual environment, type:

```shell
python3 -m venv ./cairo_venv
source ./cairo_venv/bin/activate
```

- Make sure you can install the following pip packages: ecdsa, fastecdsa, sympy (using pip3 install ecdsa fastecdsa sympy). On Ubuntu, for example, you will have to first run:

```shell
sudo apt install -y libgmp3-dev
```

- On Mac, you can use `brew`:

```shell
brew install gmp
```

- Install the `cairo-lang` python package using:

```shell
pip3 install cairo-lang
```

- Install the `openzeppelin-cairo-contracts` package using:

```shell
pip install openzeppelin-cairo-contracts
```

- Set `cairo-format` in Visual Studio Code: `"cairo.cairoFormatPath": "[Project Root Path]/cairo_venv/bin/cairo-format"`
