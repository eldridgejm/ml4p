import argparse
import pathlib

from . import js


def js_make_preview(args):
    print("Making preview for JavaScript figure...")
    js.make_preview(pathlib.Path.cwd())

def js_generate_static(args):
    print("Generating static figures from JavaScript...")
    js.generate_static(pathlib.Path.cwd())


def setup_js_parser(js_parser: argparse.ArgumentParser):
    js_subparsers = js_parser.add_subparsers(dest="subsubcommand")

    make_preview_parser = js_subparsers.add_parser("make-preview")
    make_preview_parser.set_defaults(func=js_make_preview)

    generate_static_parser = js_subparsers.add_parser("generate-static")
    generate_static_parser.set_defaults(func=js_generate_static)


def main():
    parser = argparse.ArgumentParser()

    # add js and py subparsers
    subparsers = parser.add_subparsers(dest="subcommand")

    js_parser = subparsers.add_parser("js")
    setup_js_parser(js_parser)

    py_parser = subparsers.add_parser("py")

    args = parser.parse_args()
    if hasattr(args, "func"):
        args.func(args)
    else:
        # was a subcommand specified?
        if args.subcommand is not None:
            subparser = subparsers.choices[args.subcommand]
            subparser.print_help()
        else:
            parser.print_help()
